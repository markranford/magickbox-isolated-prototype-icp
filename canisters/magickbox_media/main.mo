import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

persistent actor MagickBoxMedia {
  type MediaAsset = {
    id : Nat;
    owner : Principal;
    job_id : Nat;
    uri : Text;
    content_hash : Text;
    mime_type : Text;
    expected_bytes : Nat;
    received_bytes : Nat;
    chunk_count : Nat;
    status : Text;
    created_at : Int;
    updated_at : Int;
  };

  type MediaChunk = {
    asset_id : Nat;
    index : Nat;
    owner : Principal;
    content : Blob;
    bytes : Nat;
    created_at : Int;
  };

  type MediaManifest = {
    asset_id : Nat;
    owner : Principal;
    job_id : Nat;
    uri : Text;
    content_hash : Text;
    mime_type : Text;
    bytes : Nat;
    chunk_count : Nat;
    storage_provider : Text;
    created_at : Int;
    committed_at : Int;
  };

  type MediaAssetResult = { #ok : MediaAsset; #err : Text };
  type MediaChunkResult = { #ok : MediaChunk; #err : Text };
  type MediaManifestResult = { #ok : MediaManifest; #err : Text };

  transient let MAX_CHUNK_BYTES : Nat = 1_000_000;
  transient let MAX_ASSET_BYTES : Nat = 500_000_000;
  transient let STORAGE_PROVIDER : Text = "icp-canister-media-store";

  var assets : [MediaAsset] = [];
  var chunks : [MediaChunk] = [];
  var next_asset_id : Nat = 1;

  func now() : Int {
    Time.now()
  };

  func append_item<T>(items : [T], item : T) : [T] {
    let size = items.size();
    Array.tabulate<T>(
      size + 1,
      func(i : Nat) : T {
        if (i < size) { items[i] } else { item };
      },
    );
  };

  func require_authenticated(caller : Principal) : ?Text {
    if (Principal.isAnonymous(caller)) {
      return ?"Internet Identity or another ICP-compatible identity is required";
    };
    null
  };

  func media_uri(asset_id : Nat, content_hash : Text) : Text {
    "icp-media://" # Principal.toText(Principal.fromActor(MagickBoxMedia)) # "/assets/" # Nat.toText(asset_id) # "#sha256=" # content_hash;
  };

  func find_asset_index(asset_id : Nat) : ?Nat {
    var i : Nat = 0;
    for (asset in assets.vals()) {
      if (asset.id == asset_id) {
        return ?i;
      };
      i += 1;
    };
    null
  };

  func replace_asset(index : Nat, updated : MediaAsset) {
    assets := Array.tabulate<MediaAsset>(
      assets.size(),
      func(i : Nat) : MediaAsset {
        if (i == index) { updated } else { assets[i] };
      },
    );
  };

  func find_chunk(asset_id : Nat, index : Nat) : ?MediaChunk {
    for (chunk in chunks.vals()) {
      if (chunk.asset_id == asset_id and chunk.index == index) {
        return ?chunk;
      };
    };
    null
  };

  func require_owner(asset : MediaAsset, caller : Principal) : ?Text {
    if (not Principal.equal(asset.owner, caller)) {
      return ?"Only the media asset owner can modify this asset";
    };
    null
  };

  func validate_hash(content_hash : Text) : ?Text {
    if (Text.size(content_hash) < 8 or Text.size(content_hash) > 128) {
      return ?"Content hash must be between 8 and 128 characters";
    };
    null
  };

  func validate_mime_type(mime_type : Text) : ?Text {
    if (Text.size(mime_type) == 0 or Text.size(mime_type) > 80) {
      return ?"MIME type must be between 1 and 80 characters";
    };
    null
  };

  func manifest_from_asset(asset : MediaAsset) : MediaManifest {
    {
      asset_id = asset.id;
      owner = asset.owner;
      job_id = asset.job_id;
      uri = asset.uri;
      content_hash = asset.content_hash;
      mime_type = asset.mime_type;
      bytes = asset.received_bytes;
      chunk_count = asset.chunk_count;
      storage_provider = STORAGE_PROVIDER;
      created_at = asset.created_at;
      committed_at = asset.updated_at;
    };
  };

  public shared ({ caller }) func create_asset(
    job_id : Nat,
    content_hash : Text,
    mime_type : Text,
    expected_bytes : Nat,
  ) : async MediaAssetResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    switch (validate_hash(content_hash)) {
      case (?err) { return #err(err) };
      case null {};
    };
    switch (validate_mime_type(mime_type)) {
      case (?err) { return #err(err) };
      case null {};
    };
    if (job_id == 0) {
      return #err("Job id must be greater than zero");
    };
    if (expected_bytes == 0 or expected_bytes > MAX_ASSET_BYTES) {
      return #err("Expected bytes must be between 1 and 500,000,000");
    };

    let timestamp = now();
    let asset_id = next_asset_id;
    let asset : MediaAsset = {
      id = asset_id;
      owner = caller;
      job_id;
      uri = media_uri(asset_id, content_hash);
      content_hash;
      mime_type;
      expected_bytes;
      received_bytes = 0;
      chunk_count = 0;
      status = "open";
      created_at = timestamp;
      updated_at = timestamp;
    };
    next_asset_id += 1;
    assets := append_item<MediaAsset>(assets, asset);
    #ok(asset);
  };

  public shared ({ caller }) func put_chunk(asset_id : Nat, index : Nat, content : Blob) : async MediaChunkResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let asset_index = switch (find_asset_index(asset_id)) {
      case (?found) { found };
      case null { return #err("Media asset not found") };
    };
    let asset = assets[asset_index];
    switch (require_owner(asset, caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    if (asset.status != "open") {
      return #err("Media asset is not open for chunk uploads");
    };
    if (index != asset.chunk_count) {
      return #err("Chunk index must match the next sequential chunk");
    };

    let bytes = Blob.toArray(content).size();
    if (bytes == 0) {
      return #err("Chunk content cannot be empty");
    };
    if (bytes > MAX_CHUNK_BYTES) {
      return #err("Chunk content exceeds the 1,000,000 byte ICP upload limit");
    };
    if (asset.received_bytes + bytes > asset.expected_bytes) {
      return #err("Chunk bytes exceed the declared asset size");
    };
    switch (find_chunk(asset_id, index)) {
      case (?_) { return #err("Chunk index already exists for this asset") };
      case null {};
    };

    let timestamp = now();
    let chunk : MediaChunk = {
      asset_id;
      index;
      owner = caller;
      content;
      bytes;
      created_at = timestamp;
    };
    chunks := append_item<MediaChunk>(chunks, chunk);

    let updated : MediaAsset = {
      id = asset.id;
      owner = asset.owner;
      job_id = asset.job_id;
      uri = asset.uri;
      content_hash = asset.content_hash;
      mime_type = asset.mime_type;
      expected_bytes = asset.expected_bytes;
      received_bytes = asset.received_bytes + bytes;
      chunk_count = asset.chunk_count + 1;
      status = asset.status;
      created_at = asset.created_at;
      updated_at = timestamp;
    };
    replace_asset(asset_index, updated);
    #ok(chunk);
  };

  public shared ({ caller }) func commit_asset(asset_id : Nat) : async MediaManifestResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let asset_index = switch (find_asset_index(asset_id)) {
      case (?found) { found };
      case null { return #err("Media asset not found") };
    };
    let asset = assets[asset_index];
    switch (require_owner(asset, caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    if (asset.status != "open") {
      return #err("Media asset is already committed");
    };
    if (asset.received_bytes != asset.expected_bytes) {
      return #err("Uploaded chunks do not match the declared asset size");
    };

    let timestamp = now();
    let committed : MediaAsset = {
      id = asset.id;
      owner = asset.owner;
      job_id = asset.job_id;
      uri = asset.uri;
      content_hash = asset.content_hash;
      mime_type = asset.mime_type;
      expected_bytes = asset.expected_bytes;
      received_bytes = asset.received_bytes;
      chunk_count = asset.chunk_count;
      status = "committed";
      created_at = asset.created_at;
      updated_at = timestamp;
    };
    replace_asset(asset_index, committed);
    #ok(manifest_from_asset(committed));
  };

  public shared query ({ caller }) func list_my_assets() : async [MediaAsset] {
    var mine : [MediaAsset] = [];
    for (asset in assets.vals()) {
      if (Principal.equal(asset.owner, caller)) {
        mine := append_item<MediaAsset>(mine, asset);
      };
    };
    mine;
  };

  public query func get_asset(asset_id : Nat) : async ?MediaAsset {
    switch (find_asset_index(asset_id)) {
      case (?index) { ?assets[index] };
      case null { null };
    };
  };

  public query func get_chunk(asset_id : Nat, index : Nat) : async ?MediaChunk {
    find_chunk(asset_id, index);
  };

  public query func get_manifest(asset_id : Nat) : async MediaManifestResult {
    let asset = switch (find_asset_index(asset_id)) {
      case (?index) { assets[index] };
      case null { return #err("Media asset not found") };
    };
    if (asset.status != "committed") {
      return #err("Media asset is not committed");
    };
    #ok(manifest_from_asset(asset));
  };

  public query func get_storage_policy() : async Text {
    "ICP-only media canister. Max chunk: " # Nat.toText(MAX_CHUNK_BYTES) # " bytes. Max asset: " # Nat.toText(MAX_ASSET_BYTES) # " bytes. Provider: " # STORAGE_PROVIDER # ".";
  };
};
