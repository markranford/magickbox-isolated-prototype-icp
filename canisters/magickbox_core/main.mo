import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

shared ({ caller = installer }) persistent actor class MagickBoxCore() = self {
  type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  transient let ICP_LEDGER_ID : Principal = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  transient let icp_ledger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
    icrc1_balance_of : shared query (Account) -> async Nat;
    icrc1_fee : shared query () -> async Nat;
  };

  type CreditOption = {
    id : Text;
    title : Text;
    description : Text;
    route : Text;
    requires_payment : Bool;
    on_icp : Bool;
  };

  type ProviderOption = {
    id : Text;
    title : Text;
    description : Text;
    on_icp_owned_state : Bool;
    requires_external_worker : Bool;
    credit_cost : Nat;
  };

  type Profile = {
    owner : Principal;
    display_name : Text;
    email : ?Text;
    credits : Nat;
    created_at : Int;
    updated_at : Int;
  };

  type GenerationJob = {
    id : Nat;
    owner : Principal;
    mode : Text;
    provider_id : Text;
    prompt_preview : Text;
    prompt_hash : Text;
    status : Text;
    credit_cost : Nat;
    result_url : ?Text;
    result_hash : ?Text;
    created_at : Int;
    updated_at : Int;
  };

  type CollectionRecord = {
    id : Nat;
    owner : Principal;
    name : Text;
    job_ids : [Nat];
    is_public : Bool;
    created_at : Int;
    updated_at : Int;
  };

  type AuditEvent = {
    id : Nat;
    caller : Principal;
    action : Text;
    subject : Text;
    metadata : Text;
    created_at : Int;
  };

  type PaymentAccount = {
    owner : Principal;
    subaccount : ?Blob;
    ledger_id : Principal;
    token_symbol : Text;
    fee_e8s : Nat;
  };

  type AdminAction = {
    id : Text;
    title : Text;
    description : Text;
    status : Text;
    route : Text;
    requires_superadmin : Bool;
  };

  type SuperAdminStatus = {
    caller : Principal;
    is_superadmin : Bool;
    superadmin_count : Nat;
    bootstrap_available : Bool;
    system_wallet_owner : Principal;
    ledger_id : Principal;
  };

  type SystemFundingWallet = {
    id : Nat;
    creator : Principal;
    account : PaymentAccount;
    subaccount_hex : Text;
    status : Text;
    created_at : Int;
    verified_at : ?Int;
    balance_e8s : Nat;
  };

  type SystemWallet = {
    account : PaymentAccount;
    balance_e8s : Nat;
    funding_wallet : ?SystemFundingWallet;
    requires_wallet_creation : Bool;
    funding_instructions : Text;
    cycles_note : Text;
  };

  type AdminDashboard = {
    status : SuperAdminStatus;
    wallet : SystemWallet;
    profile_count : Nat;
    job_count : Nat;
    pending_payment_count : Nat;
    claimed_payment_count : Nat;
    media_manifest_count : Nat;
    worker_grant_count : Nat;
    worker_run_count : Nat;
    ad_credit_grant_count : Nat;
    audit_event_count : Nat;
    total_user_credits : Nat;
    actions : [AdminAction];
  };

  type PaymentIntent = {
    id : Nat;
    owner : Principal;
    payment_principal : Principal;
    payment_subaccount : ?Blob;
    payment_subaccount_hex : Text;
    amount_e8s : Nat;
    credits : Nat;
    status : Text;
    ledger_block_index : ?Nat;
    created_at : Int;
    updated_at : Int;
  };

  type WorkerGrant = {
    id : Nat;
    owner : Principal;
    worker : Principal;
    worker_label : Text;
    created_at : Int;
    revoked_at : ?Int;
  };

  type WorkerRun = {
    id : Nat;
    job_id : Nat;
    owner : Principal;
    worker : Principal;
    provider_id : Text;
    result_url : Text;
    result_hash : Text;
    receipt : Text;
    output_preview : Text;
    created_at : Int;
  };

  type AdCreditGrant = {
    id : Nat;
    owner : Principal;
    verifier : Text;
    proof_id : Text;
    credits : Nat;
    created_at : Int;
  };

  type MediaAsset = {
    id : Nat;
    owner : Principal;
    job_id : Nat;
    stored_by : Principal;
    uri : Text;
    content_hash : Text;
    mime_type : Text;
    bytes : Nat;
    content : Blob;
    created_at : Int;
  };

  type MediaManifest = {
    id : Nat;
    owner : Principal;
    job_id : Nat;
    attached_by : Principal;
    storage_provider : Text;
    uri : Text;
    content_hash : Text;
    mime_type : Text;
    bytes : Nat;
    created_at : Int;
  };

  type CreateJobResult = {
    #ok : GenerationJob;
    #insufficient_credits : {
      required : Nat;
      balance : Nat;
      options : [CreditOption];
    };
    #err : Text;
  };

  type ProfileResult = { #ok : Profile; #err : Text };
  type JobResult = { #ok : GenerationJob; #err : Text };
  type CollectionResult = { #ok : CollectionRecord; #err : Text };
  type PaymentAccountResult = { #ok : PaymentAccount; #err : Text };
  type SuperAdminStatusResult = { #ok : SuperAdminStatus; #err : Text };
  type SystemFundingWalletResult = { #ok : SystemFundingWallet; #err : Text };
  type SystemWalletResult = { #ok : SystemWallet; #err : Text };
  type AdminDashboardResult = { #ok : AdminDashboard; #err : Text };
  type PaymentIntentResult = { #ok : PaymentIntent; #err : Text };
  type WorkerGrantResult = { #ok : WorkerGrant; #err : Text };
  type WorkerRunResult = { #ok : WorkerRun; #err : Text };
  type AdCreditGrantResult = { #ok : AdCreditGrant; #err : Text };
  type MediaAssetResult = { #ok : MediaAsset; #err : Text };
  type MediaManifestResult = { #ok : MediaManifest; #err : Text };

  var profiles : [Profile] = [];
  var jobs : [GenerationJob] = [];
  var collections : [CollectionRecord] = [];
  var audit_events : [AuditEvent] = [];
  var payment_intents : [PaymentIntent] = [];
  var worker_grants : [WorkerGrant] = [];
  var worker_runs : [WorkerRun] = [];
  var ad_credit_grants : [AdCreditGrant] = [];
  var media_assets : [MediaAsset] = [];
  var media_manifests : [MediaManifest] = [];
  // Seed the first admin from the install caller so public bootstrap codes are never needed.
  var super_admins : [Principal] = if (Principal.isAnonymous(installer)) { [] } else { [installer] };
  var system_funding_wallets : [SystemFundingWallet] = [];
  var claimed_payment_blocks : [Nat] = [];
  var next_job_id : Nat = 1;
  var next_collection_id : Nat = 1;
  var next_audit_id : Nat = 1;
  var next_payment_intent_id : Nat = 1;
  var next_worker_grant_id : Nat = 1;
  var next_worker_run_id : Nat = 1;
  var next_ad_credit_grant_id : Nat = 1;
  var next_media_asset_id : Nat = 1;
  var next_media_manifest_id : Nat = 1;
  var next_system_funding_wallet_id : Nat = 1;

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

  func is_listed_superadmin(caller : Principal) : Bool {
    for (admin in super_admins.vals()) {
      if (Principal.equal(admin, caller)) {
        return true;
      };
    };
    false
  };

  func is_superadmin(caller : Principal) : Bool {
    if (
      super_admins.size() == 0 and
      not Principal.isAnonymous(installer) and
      Principal.equal(installer, caller)
    ) {
      return true;
    };
    is_listed_superadmin(caller);
  };

  func require_superadmin(caller : Principal) : ?Text {
    switch (require_authenticated(caller)) {
      case (?err) { return ?err };
      case null {};
    };
    if (not is_superadmin(caller)) {
      return ?"Superadmin access is required";
    };
    null
  };

  func add_superadmin_internal(admin : Principal) : Bool {
    if (Principal.isAnonymous(admin) or is_listed_superadmin(admin)) {
      return false;
    };
    super_admins := append_item<Principal>(super_admins, admin);
    true;
  };

  func remove_superadmin_internal(admin : Principal) : Bool {
    var removed = false;
    var next : [Principal] = [];
    for (existing in super_admins.vals()) {
      if (Principal.equal(existing, admin)) {
        removed := true;
      } else {
        next := append_item<Principal>(next, existing);
      };
    };
    if (removed) {
      super_admins := next;
    };
    removed;
  };

  func find_profile_index(owner : Principal) : ?Nat {
    var i : Nat = 0;
    for (profile in profiles.vals()) {
      if (Principal.equal(profile.owner, owner)) {
        return ?i;
      };
      i += 1;
    };
    null
  };

  func find_job_index(id : Nat) : ?Nat {
    var i : Nat = 0;
    for (job in jobs.vals()) {
      if (job.id == id) {
        return ?i;
      };
      i += 1;
    };
    null
  };

  func find_payment_intent_index(id : Nat) : ?Nat {
    var i : Nat = 0;
    for (intent in payment_intents.vals()) {
      if (intent.id == id) {
        return ?i;
      };
      i += 1;
    };
    null
  };

  func has_claimed_payment_block(block_index : Nat) : Bool {
    for (claimed in claimed_payment_blocks.vals()) {
      if (claimed == block_index) {
        return true;
      };
    };
    false
  };

  func ad_proof_already_used(verifier : Text, proof_id : Text) : Bool {
    for (grant in ad_credit_grants.vals()) {
      if (grant.verifier == verifier and grant.proof_id == proof_id) {
        return true;
      };
    };
    false
  };

  func is_authorized_worker(owner : Principal, worker : Principal) : Bool {
    if (Principal.equal(owner, worker)) {
      return true;
    };

    for (grant in worker_grants.vals()) {
      if (
        Principal.equal(grant.owner, owner) and
        Principal.equal(grant.worker, worker) and
        grant.revoked_at == null
      ) {
        return true;
      };
    };
    false
  };

  func replace_profile(index : Nat, profile : Profile) {
    profiles := Array.tabulate<Profile>(
      profiles.size(),
      func(i : Nat) : Profile {
        if (i == index) { profile } else { profiles[i] };
      },
    );
  };

  func replace_job(index : Nat, job : GenerationJob) {
    jobs := Array.tabulate<GenerationJob>(
      jobs.size(),
      func(i : Nat) : GenerationJob {
        if (i == index) { job } else { jobs[i] };
      },
    );
  };

  func replace_payment_intent(index : Nat, intent : PaymentIntent) {
    payment_intents := Array.tabulate<PaymentIntent>(
      payment_intents.size(),
      func(i : Nat) : PaymentIntent {
        if (i == index) { intent } else { payment_intents[i] };
      },
    );
  };

  func payment_account() : PaymentAccount {
    {
      owner = Principal.fromActor(self);
      subaccount = null;
      ledger_id = ICP_LEDGER_ID;
      token_symbol = "ICP";
      fee_e8s = 10_000;
    };
  };

  func subaccount_for_system_funding_wallet(wallet_id : Nat) : Blob {
    // "MBFUND" prefixes dedicated system funding subaccounts.
    let bytes : [Nat8] = [
      77, 66, 70, 85, 78, 68, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      nat_byte(wallet_id, 7), nat_byte(wallet_id, 6), nat_byte(wallet_id, 5), nat_byte(wallet_id, 4),
      nat_byte(wallet_id, 3), nat_byte(wallet_id, 2), nat_byte(wallet_id, 1), nat_byte(wallet_id, 0),
    ];
    Blob.fromArray(bytes);
  };

  func account_for_system_funding_wallet(wallet_id : Nat) : PaymentAccount {
    {
      owner = Principal.fromActor(self);
      subaccount = ?subaccount_for_system_funding_wallet(wallet_id);
      ledger_id = ICP_LEDGER_ID;
      token_symbol = "ICP";
      fee_e8s = 10_000;
    };
  };

  func active_system_funding_wallet() : ?SystemFundingWallet {
    var active : ?SystemFundingWallet = null;
    for (wallet in system_funding_wallets.vals()) {
      if (wallet.status == "active") {
        active := ?wallet;
      };
    };
    active;
  };

  func wallet_with_balance(wallet : SystemFundingWallet, balance_e8s : Nat) : SystemFundingWallet {
    {
      id = wallet.id;
      creator = wallet.creator;
      account = wallet.account;
      subaccount_hex = wallet.subaccount_hex;
      status = wallet.status;
      created_at = wallet.created_at;
      verified_at = ?now();
      balance_e8s;
    };
  };

  func active_system_wallet_account() : PaymentAccount {
    switch (active_system_funding_wallet()) {
      case (?wallet) { wallet.account };
      case null { payment_account() };
    };
  };

  func superadmin_status(caller : Principal) : SuperAdminStatus {
    {
      caller;
      is_superadmin = is_superadmin(caller);
      superadmin_count = super_admins.size();
      bootstrap_available = false;
      system_wallet_owner = payment_account().owner;
      ledger_id = ICP_LEDGER_ID;
    };
  };

  func system_wallet_instructions(account : PaymentAccount, funding_wallet : ?SystemFundingWallet) : Text {
    switch (funding_wallet) {
      case (?wallet) {
        "Fund the Magick Box system wallet by transferring ICP to owner " #
        Principal.toText(account.owner) #
        " with subaccount " #
        wallet.subaccount_hex #
        ". This wallet was created by a superadmin and is separate from user credit purchase subaccounts.";
      };
      case null {
        "Create a dedicated system funding wallet from the superadmin dashboard before transferring ICP. User credit purchases stay on per-intent subaccounts.";
      };
    };
  };

  func system_wallet_status(account : PaymentAccount, funding_wallet : ?SystemFundingWallet, balance_e8s : Nat) : SystemWallet {
    let hydrated_wallet = switch (funding_wallet) {
      case (?wallet) { ?wallet_with_balance(wallet, balance_e8s) };
      case null { null };
    };
    {
      account;
      balance_e8s;
      funding_wallet = hydrated_wallet;
      requires_wallet_creation = switch (hydrated_wallet) { case null { true }; case (?_) { false } };
      funding_instructions = system_wallet_instructions(account, hydrated_wallet);
      cycles_note = "Use the funded controller identity to convert ICP to cycles and top up canisters. This prototype never auto-spends main wallet funds.";
    };
  };

  func admin_actions() : [AdminAction] {
    [
      {
        id = "fund_main_wallet";
        title = "Create system funding wallet";
        description = "Create a dedicated ICP subaccount from the superadmin dashboard, then fund and verify it on-chain.";
        status = "ready";
        route = "system-wallet";
        requires_superadmin = true;
      },
      {
        id = "manage_credits";
        title = "Payment and credit controls";
        description = "Review payment intents, claimed blocks, user credit liability, ad grants, and subscription readiness.";
        status = "ready";
        route = "payments";
        requires_superadmin = true;
      },
      {
        id = "manage_workers";
        title = "Worker and AI routes";
        description = "Review authorized workers, local Ollama, FreeLLMAPI, MagickAI, and paid-provider boundaries.";
        status = "ready";
        route = "workers";
        requires_superadmin = true;
      },
      {
        id = "manage_media";
        title = "ICP media storage";
        description = "Track committed media manifests and dedicated media canister storage health.";
        status = "ready";
        route = "media";
        requires_superadmin = true;
      },
      {
        id = "deployment_safety";
        title = "Deployment safety";
        description = "Confirm backup controllers, cycle monitoring, II principal binding, and production isolation before mainnet.";
        status = "requires-mainnet-funding";
        route = "deployment";
        requires_superadmin = true;
      },
      {
        id = "provider_secrets";
        title = "Provider secret boundary";
        description = "Keep API keys outside canister state; route inference through isolated workers or local models.";
        status = "external-required";
        route = "providers";
        requires_superadmin = true;
      },
    ];
  };

  func count_payment_intents_with_status(status : Text) : Nat {
    var count : Nat = 0;
    for (intent in payment_intents.vals()) {
      if (intent.status == status) {
        count += 1;
      };
    };
    count;
  };

  func total_profile_credits() : Nat {
    var total : Nat = 0;
    for (profile in profiles.vals()) {
      total += profile.credits;
    };
    total;
  };

  func nat_byte(value : Nat, byte_index_from_lsb : Nat) : Nat8 {
    var shifted = value;
    var i : Nat = 0;
    while (i < byte_index_from_lsb) {
      shifted /= 256;
      i += 1;
    };
    Nat8.fromNat(shifted % 256);
  };

  func subaccount_for_payment_intent(intent_id : Nat) : Blob {
    let bytes : [Nat8] = [
      77, 66, 80, 65, 89, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      nat_byte(intent_id, 7), nat_byte(intent_id, 6), nat_byte(intent_id, 5), nat_byte(intent_id, 4),
      nat_byte(intent_id, 3), nat_byte(intent_id, 2), nat_byte(intent_id, 1), nat_byte(intent_id, 0),
    ];
    Blob.fromArray(bytes);
  };

  func blob_to_hex(blob : Blob) : Text {
    let hex_chars : [Text] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    var hex = "";
    for (byte in Blob.toArray(blob).vals()) {
      let value = Nat8.toNat(byte);
      hex := hex # hex_chars[value / 16] # hex_chars[value % 16];
    };
    hex;
  };

  func account_for_payment_intent(intent_id : Nat) : PaymentAccount {
    {
      owner = Principal.fromActor(self);
      subaccount = ?subaccount_for_payment_intent(intent_id);
      ledger_id = ICP_LEDGER_ID;
      token_symbol = "ICP";
      fee_e8s = 10_000;
    };
  };

  func media_asset_uri(asset_id : Nat, content_hash : Text) : Text {
    "icp-media://" # Principal.toText(Principal.fromActor(self)) # "/media/" # Nat.toText(asset_id) # "#sha256=" # content_hash;
  };

  func media_storage_provider() : Text {
    "icp-canister-media-store";
  };

  func credit_profile(owner : Principal, credits : Nat) : ?Profile {
    switch (find_profile_index(owner)) {
      case (?index) {
        let profile = profiles[index];
        let timestamp = now();
        let updated : Profile = {
          owner = profile.owner;
          display_name = profile.display_name;
          email = profile.email;
          credits = profile.credits + credits;
          created_at = profile.created_at;
          updated_at = timestamp;
        };
        replace_profile(index, updated);
        ?updated;
      };
      case null { null };
    };
  };

  func record_audit(caller : Principal, action : Text, subject : Text, metadata : Text) {
    let event : AuditEvent = {
      id = next_audit_id;
      caller;
      action;
      subject;
      metadata;
      created_at = now();
    };
    next_audit_id += 1;
    audit_events := append_item<AuditEvent>(audit_events, event);
  };

  func complete_job_internal(
    caller : Principal,
    job_id : Nat,
    result_url : Text,
    result_hash : Text,
    receipt : Text,
    output_preview : Text,
  ) : JobResult {
    let job_index = switch (find_job_index(job_id)) {
      case (?index) { index };
      case null { return #err("Job not found") };
    };
    let job = jobs[job_index];
    if (not is_authorized_worker(job.owner, caller)) {
      return #err("Only the job owner or an authorized worker can complete this job");
    };
    if (Text.size(result_url) == 0 or Text.size(result_url) > 500) {
      return #err("Result URL must be between 1 and 500 characters");
    };
    if (Text.size(result_hash) < 8 or Text.size(result_hash) > 128) {
      return #err("Result hash must be between 8 and 128 characters");
    };
    if (Text.size(receipt) > 2_000) {
      return #err("Worker receipt must be 2,000 characters or less");
    };
    if (Text.size(output_preview) > 1_000) {
      return #err("Output preview must be 1,000 characters or less");
    };

    let timestamp = now();
    let updated : GenerationJob = {
      id = job.id;
      owner = job.owner;
      mode = job.mode;
      provider_id = job.provider_id;
      prompt_preview = job.prompt_preview;
      prompt_hash = job.prompt_hash;
      status = "complete";
      credit_cost = job.credit_cost;
      result_url = ?result_url;
      result_hash = ?result_hash;
      created_at = job.created_at;
      updated_at = timestamp;
    };
    replace_job(job_index, updated);

    let run : WorkerRun = {
      id = next_worker_run_id;
      job_id;
      owner = job.owner;
      worker = caller;
      provider_id = job.provider_id;
      result_url;
      result_hash;
      receipt;
      output_preview;
      created_at = timestamp;
    };
    next_worker_run_id += 1;
    worker_runs := append_item<WorkerRun>(worker_runs, run);
    record_audit(caller, "generation_job_completed", Nat.toText(job_id), "external worker completion");
    #ok(updated);
  };

  func cost_for_provider(provider_id : Text, requested_cost : Nat) : Nat {
    if (
      provider_id == "freellmapi" or
      provider_id == "own_api_key" or
      provider_id == "local_ollama"
    ) {
      0;
    } else if (requested_cost == 0) {
      25;
    } else {
      requested_cost;
    };
  };

  public shared query ({ caller }) func get_superadmin_status() : async SuperAdminStatus {
    superadmin_status(caller);
  };

  public shared ({ caller }) func bootstrap_superadmin(_setup_code : Text) : async SuperAdminStatusResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    #err("Public superadmin bootstrap is disabled. Deploy with the isolated controller identity, then add II principals from an existing superadmin.");
  };

  public shared ({ caller }) func add_superadmin(new_admin : Principal) : async SuperAdminStatusResult {
    switch (require_superadmin(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    if (Principal.isAnonymous(new_admin)) {
      return #err("Superadmin principal cannot be anonymous");
    };
    if (is_superadmin(new_admin)) {
      return #err("Principal is already a superadmin");
    };
    ignore add_superadmin_internal(new_admin);
    record_audit(caller, "superadmin_added", Principal.toText(new_admin), "added from management dashboard or CLI");
    #ok(superadmin_status(caller));
  };

  public shared ({ caller }) func remove_superadmin(admin : Principal) : async SuperAdminStatusResult {
    switch (require_superadmin(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    if (super_admins.size() <= 1 and is_superadmin(admin)) {
      return #err("Cannot remove the final superadmin");
    };
    if (not remove_superadmin_internal(admin)) {
      return #err("Principal is not a superadmin");
    };
    record_audit(caller, "superadmin_removed", Principal.toText(admin), "removed from management dashboard or CLI");
    #ok(superadmin_status(caller));
  };

  public shared ({ caller }) func create_system_funding_wallet() : async SystemFundingWalletResult {
    switch (require_superadmin(caller)) {
      case (?err) { return #err("Only superadmins can create the system funding wallet: " # err) };
      case null {};
    };
    switch (active_system_funding_wallet()) {
      case (?wallet) { return #ok(wallet) };
      case null {};
    };
    let wallet_id = next_system_funding_wallet_id;
    let account = account_for_system_funding_wallet(wallet_id);
    let subaccount_hex = switch (account.subaccount) {
      case (?subaccount) { blob_to_hex(subaccount) };
      case null { "" };
    };
    let wallet : SystemFundingWallet = {
      id = wallet_id;
      creator = caller;
      account;
      subaccount_hex;
      status = "active";
      created_at = now();
      verified_at = null;
      balance_e8s = 0;
    };
    system_funding_wallets := append_item<SystemFundingWallet>(system_funding_wallets, wallet);
    next_system_funding_wallet_id += 1;
    record_audit(
      caller,
      "system_funding_wallet_created",
      Nat.toText(wallet.id),
      "Only superadmins can create the system funding wallet; subaccount=" # wallet.subaccount_hex,
    );
    #ok(wallet);
  };

  public shared ({ caller }) func get_system_wallet_status() : async SystemWalletResult {
    switch (require_superadmin(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    let funding_wallet = active_system_funding_wallet();
    let account = active_system_wallet_account();
    let balance = await icp_ledger.icrc1_balance_of({
      owner = account.owner;
      subaccount = account.subaccount;
    });
    #ok(system_wallet_status(account, funding_wallet, balance));
  };

  public shared ({ caller }) func get_admin_dashboard() : async AdminDashboardResult {
    switch (require_superadmin(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };
    let funding_wallet = active_system_funding_wallet();
    let account = active_system_wallet_account();
    let balance = await icp_ledger.icrc1_balance_of({
      owner = account.owner;
      subaccount = account.subaccount;
    });
    #ok({
      status = superadmin_status(caller);
      wallet = system_wallet_status(account, funding_wallet, balance);
      profile_count = profiles.size();
      job_count = jobs.size();
      pending_payment_count = count_payment_intents_with_status("pending");
      claimed_payment_count = count_payment_intents_with_status("claimed");
      media_manifest_count = media_manifests.size();
      worker_grant_count = worker_grants.size();
      worker_run_count = worker_runs.size();
      ad_credit_grant_count = ad_credit_grants.size();
      audit_event_count = audit_events.size();
      total_user_credits = total_profile_credits();
      actions = admin_actions();
    });
  };

  public shared query ({ caller }) func list_admin_audit_events() : async [AuditEvent] {
    switch (require_superadmin(caller)) {
      case (?_) { return [] };
      case null {};
    };
    audit_events;
  };

  public query func get_credit_options() : async [CreditOption] {
    [
      {
        id = "icp_topup";
        title = "Top up with ICP";
        description = "Buy Magick credits with an ICP or ICRC-compatible payment flow.";
        route = "icp-payment";
        requires_payment = true;
        on_icp = true;
      },
      {
        id = "icp_subscription";
        title = "Subscribe with ICP";
        description = "Use an ICP-native subscription or recurring credit package when available.";
        route = "icp-subscription";
        requires_payment = true;
        on_icp = true;
      },
      {
        id = "watch_ad";
        title = "Watch an advert";
        description = "Earn credits after an external ad verifier grants a canister credit event.";
        route = "ad-credit";
        requires_payment = false;
        on_icp = false;
      },
      {
        id = "freellmapi";
        title = "Use FreeLLMAPI";
        description = "Route chat-style work to a user-managed OpenAI-compatible free-tier proxy.";
        route = "freellmapi";
        requires_payment = false;
        on_icp = false;
      },
      {
        id = "own_api_key";
        title = "Connect own AI subscription";
        description = "Use a provider subscription you already pay for without storing raw keys on ICP.";
        route = "own-provider";
        requires_payment = false;
        on_icp = false;
      },
      {
        id = "local_ollama";
        title = "Connect local Ollama";
        description = "Use a local model such as Qwen, Gemma, GLM, or another Ollama model.";
        route = "local-llm";
        requires_payment = false;
        on_icp = false;
      },
    ];
  };

  public query func get_provider_options() : async [ProviderOption] {
    [
      {
        id = "magick_ai_worker";
        title = "MagickAI worker";
        description = "Rich Magick Friend media generation through the MagickAI SDK worker boundary.";
        on_icp_owned_state = true;
        requires_external_worker = true;
        credit_cost = 20;
      },
      {
        id = "freellmapi";
        title = "FreeLLMAPI";
        description = "OpenAI-compatible free-provider fallback for chat-style requests.";
        on_icp_owned_state = true;
        requires_external_worker = true;
        credit_cost = 0;
      },
      {
        id = "own_api_key";
        title = "Own AI subscription";
        description = "User-provided provider key, stored outside canister state.";
        on_icp_owned_state = true;
        requires_external_worker = true;
        credit_cost = 0;
      },
      {
        id = "local_ollama";
        title = "Local Ollama";
        description = "User-managed local LLM endpoint for privacy and no paid inference.";
        on_icp_owned_state = true;
        requires_external_worker = true;
        credit_cost = 0;
      },
      {
        id = "paid_managed";
        title = "Paid managed provider";
        description = "Premium Magick Box provider route with ICP credit debit.";
        on_icp_owned_state = true;
        requires_external_worker = true;
        credit_cost = 80;
      },
    ];
  };

  public query func get_payment_account() : async PaymentAccount {
    payment_account();
  };

  public shared query ({ caller }) func get_payment_account_for_intent(intent_id : Nat) : async PaymentAccountResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let intent_index = switch (find_payment_intent_index(intent_id)) {
      case (?index) { index };
      case null { return #err("Payment intent not found") };
    };
    let intent = payment_intents[intent_index];
    if (not Principal.equal(intent.owner, caller)) {
      return #err("Only the payment intent owner can view this payment account");
    };

    #ok(account_for_payment_intent(intent.id));
  };

  public shared ({ caller }) func register_profile(display_name : Text, email : ?Text) : async ProfileResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (Text.size(display_name) == 0 or Text.size(display_name) > 80) {
      return #err("Display name must be between 1 and 80 characters");
    };

    let timestamp = now();
    switch (find_profile_index(caller)) {
      case (?index) {
        let existing = profiles[index];
        let updated : Profile = {
          owner = caller;
          display_name;
          email;
          credits = existing.credits;
          created_at = existing.created_at;
          updated_at = timestamp;
        };
        replace_profile(index, updated);
        record_audit(caller, "profile_updated", Principal.toText(caller), "profile metadata updated");
        #ok(updated);
      };
      case null {
        let profile : Profile = {
          owner = caller;
          display_name;
          email;
          credits = 25;
          created_at = timestamp;
          updated_at = timestamp;
        };
        profiles := append_item<Profile>(profiles, profile);
        record_audit(caller, "profile_registered", Principal.toText(caller), "seeded 25 demo credits");
        #ok(profile);
      };
    };
  };

  public shared query ({ caller }) func get_my_profile() : async ?Profile {
    switch (find_profile_index(caller)) {
      case (?index) { ?profiles[index] };
      case null { null };
    };
  };

  public shared ({ caller }) func create_icp_payment_intent(credits : Nat, amount_e8s : Nat) : async PaymentIntentResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (credits == 0 or credits > 100_000) {
      return #err("Credit amount must be between 1 and 100,000");
    };
    if (amount_e8s < 10_000) {
      return #err("ICP payment amount must cover at least the local ledger fee");
    };
    switch (find_profile_index(caller)) {
      case (?_) {};
      case null { return #err("Profile must be registered before creating payment intents") };
    };

    let timestamp = now();
    let intent_id = next_payment_intent_id;
    let payment_subaccount = subaccount_for_payment_intent(intent_id);
    let intent : PaymentIntent = {
      id = intent_id;
      owner = caller;
      payment_principal = payment_account().owner;
      payment_subaccount = ?payment_subaccount;
      payment_subaccount_hex = blob_to_hex(payment_subaccount);
      amount_e8s;
      credits;
      status = "pending";
      ledger_block_index = null;
      created_at = timestamp;
      updated_at = timestamp;
    };
    next_payment_intent_id += 1;
    payment_intents := append_item<PaymentIntent>(payment_intents, intent);
    record_audit(caller, "icp_payment_intent_created", Nat.toText(intent.id), "amount_e8s=" # Nat.toText(amount_e8s) # ";credits=" # Nat.toText(credits) # ";subaccount=" # intent.payment_subaccount_hex);
    #ok(intent);
  };

  public shared ({ caller }) func claim_icp_payment(intent_id : Nat, ledger_block_index : Nat) : async PaymentIntentResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (has_claimed_payment_block(ledger_block_index)) {
      return #err("Ledger block index has already been claimed");
    };

    let intent_index = switch (find_payment_intent_index(intent_id)) {
      case (?index) { index };
      case null { return #err("Payment intent not found") };
    };
    let intent = payment_intents[intent_index];
    if (not Principal.equal(intent.owner, caller)) {
      return #err("Only the payment intent owner can claim this transfer");
    };
    if (intent.status != "pending") {
      return #err("Payment intent is not pending");
    };

    let account = account_for_payment_intent(intent.id);
    let observed_balance = await icp_ledger.icrc1_balance_of({
      owner = account.owner;
      subaccount = account.subaccount;
    });
    if (observed_balance < intent.amount_e8s) {
      return #err("ICP ledger subaccount balance has not reached the expected paid amount");
    };

    switch (credit_profile(caller, intent.credits)) {
      case (?_) {};
      case null { return #err("Profile must be registered before claiming payment") };
    };

    let timestamp = now();
    let updated : PaymentIntent = {
      id = intent.id;
      owner = intent.owner;
      payment_principal = intent.payment_principal;
      payment_subaccount = intent.payment_subaccount;
      payment_subaccount_hex = intent.payment_subaccount_hex;
      amount_e8s = intent.amount_e8s;
      credits = intent.credits;
      status = "claimed";
      ledger_block_index = ?ledger_block_index;
      created_at = intent.created_at;
      updated_at = timestamp;
    };
    replace_payment_intent(intent_index, updated);
    claimed_payment_blocks := append_item<Nat>(claimed_payment_blocks, ledger_block_index);
    record_audit(caller, "icp_payment_claimed", Nat.toText(intent.id), "block=" # Nat.toText(ledger_block_index) # ";credits=" # Nat.toText(intent.credits) # ";subaccount=" # intent.payment_subaccount_hex);
    #ok(updated);
  };

  public shared ({ caller }) func grant_ad_credits(verifier : Text, proof_id : Text, credits : Nat) : async AdCreditGrantResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (Text.size(verifier) == 0 or Text.size(verifier) > 80) {
      return #err("Ad verifier must be between 1 and 80 characters");
    };
    if (Text.size(proof_id) < 8 or Text.size(proof_id) > 128) {
      return #err("Ad proof id must be between 8 and 128 characters");
    };
    if (credits == 0 or credits > 250) {
      return #err("Ad credit grant must be between 1 and 250 credits");
    };
    if (ad_proof_already_used(verifier, proof_id)) {
      return #err("Ad proof has already been credited");
    };

    switch (credit_profile(caller, credits)) {
      case (?_) {};
      case null { return #err("Profile must be registered before claiming ad credits") };
    };

    let grant : AdCreditGrant = {
      id = next_ad_credit_grant_id;
      owner = caller;
      verifier;
      proof_id;
      credits;
      created_at = now();
    };
    next_ad_credit_grant_id += 1;
    ad_credit_grants := append_item<AdCreditGrant>(ad_credit_grants, grant);
    record_audit(caller, "ad_credits_granted", proof_id, "verifier=" # verifier # ";credits=" # Nat.toText(credits));
    #ok(grant);
  };

  public shared ({ caller }) func create_generation_job(
    mode : Text,
    provider_id : Text,
    prompt_preview : Text,
    prompt_hash : Text,
    requested_cost : Nat,
  ) : async CreateJobResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (Text.size(mode) == 0 or Text.size(mode) > 32) {
      return #err("Generation mode is invalid");
    };
    if (Text.size(prompt_preview) == 0 or Text.size(prompt_preview) > 280) {
      return #err("Prompt preview must be between 1 and 280 characters");
    };
    if (Text.size(prompt_hash) < 8 or Text.size(prompt_hash) > 128) {
      return #err("Prompt hash must be between 8 and 128 characters");
    };

    let profile_index = switch (find_profile_index(caller)) {
      case (?index) { index };
      case null { return #err("Profile must be registered before creating jobs") };
    };

    let profile = profiles[profile_index];
    let credit_cost = cost_for_provider(provider_id, requested_cost);

    if (profile.credits < credit_cost) {
      record_audit(
        caller,
        "generation_insufficient_credits",
        provider_id,
        "required=" # Nat.toText(credit_cost) # ";balance=" # Nat.toText(profile.credits),
      );
      return #insufficient_credits({
        required = credit_cost;
        balance = profile.credits;
        options = await get_credit_options();
      });
    };

    let timestamp = now();
    let updated_profile : Profile = {
      owner = profile.owner;
      display_name = profile.display_name;
      email = profile.email;
      credits = profile.credits - credit_cost;
      created_at = profile.created_at;
      updated_at = timestamp;
    };
    replace_profile(profile_index, updated_profile);

    let job : GenerationJob = {
      id = next_job_id;
      owner = caller;
      mode;
      provider_id;
      prompt_preview;
      prompt_hash;
      status = "queued";
      credit_cost;
      result_url = null;
      result_hash = null;
      created_at = timestamp;
      updated_at = timestamp;
    };

    next_job_id += 1;
    jobs := append_item<GenerationJob>(jobs, job);
    record_audit(caller, "generation_job_created", Nat.toText(job.id), "provider=" # provider_id);
    #ok(job);
  };

  public shared ({ caller }) func authorize_worker(worker : Principal, worker_label : Text) : async WorkerGrantResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    if (Principal.isAnonymous(worker)) {
      return #err("Worker principal cannot be anonymous");
    };
    if (Text.size(worker_label) == 0 or Text.size(worker_label) > 80) {
      return #err("Worker label must be between 1 and 80 characters");
    };

    let grant : WorkerGrant = {
      id = next_worker_grant_id;
      owner = caller;
      worker;
      worker_label;
      created_at = now();
      revoked_at = null;
    };
    next_worker_grant_id += 1;
    worker_grants := append_item<WorkerGrant>(worker_grants, grant);
    record_audit(caller, "worker_authorized", Principal.toText(worker), "label=" # worker_label);
    #ok(grant);
  };

  public shared ({ caller }) func complete_worker_job(
    job_id : Nat,
    result_url : Text,
    result_hash : Text,
    receipt : Text,
    output_preview : Text,
  ) : async JobResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    complete_job_internal(caller, job_id, result_url, result_hash, receipt, output_preview);
  };

  public shared ({ caller }) func complete_external_job(job_id : Nat, result_url : Text, result_hash : Text) : async JobResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    complete_job_internal(caller, job_id, result_url, result_hash, "legacy external completion", "");
  };

  public shared ({ caller }) func store_media_asset(
    job_id : Nat,
    content_hash : Text,
    mime_type : Text,
    content : Blob,
  ) : async MediaAssetResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let job_index = switch (find_job_index(job_id)) {
      case (?index) { index };
      case null { return #err("Job not found") };
    };
    let job = jobs[job_index];
    if (not is_authorized_worker(job.owner, caller)) {
      return #err("Only the job owner or an authorized worker can store media");
    };
    if (Text.size(content_hash) < 8 or Text.size(content_hash) > 128) {
      return #err("Content hash must be between 8 and 128 characters");
    };
    if (Text.size(mime_type) == 0 or Text.size(mime_type) > 80) {
      return #err("MIME type must be between 1 and 80 characters");
    };

    let bytes = Blob.toArray(content).size();
    if (bytes == 0) {
      return #err("Media content cannot be empty");
    };
    if (bytes > 500_000) {
      return #err("Prototype ICP media asset limit is 500,000 bytes; use dedicated ICP chunk canisters for larger media");
    };

    let asset_id = next_media_asset_id;
    let asset : MediaAsset = {
      id = asset_id;
      owner = job.owner;
      job_id;
      stored_by = caller;
      uri = media_asset_uri(asset_id, content_hash);
      content_hash;
      mime_type;
      bytes;
      content;
      created_at = now();
    };
    next_media_asset_id += 1;
    media_assets := append_item<MediaAsset>(media_assets, asset);
    record_audit(caller, "media_asset_stored_on_icp", Nat.toText(job_id), "asset=" # Nat.toText(asset.id) # ";hash=" # content_hash # ";bytes=" # Nat.toText(bytes));
    #ok(asset);
  };

  public shared ({ caller }) func attach_media_manifest(
    job_id : Nat,
    storage_provider : Text,
    uri : Text,
    content_hash : Text,
    mime_type : Text,
    bytes : Nat,
  ) : async MediaManifestResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let job_index = switch (find_job_index(job_id)) {
      case (?index) { index };
      case null { return #err("Job not found") };
    };
    let job = jobs[job_index];
    if (not is_authorized_worker(job.owner, caller)) {
      return #err("Only the job owner or an authorized worker can attach media");
    };
    if (Text.size(storage_provider) == 0 or Text.size(storage_provider) > 80) {
      return #err("Storage provider must be between 1 and 80 characters");
    };
    if (storage_provider != media_storage_provider()) {
      return #err("Only icp-canister-media-store manifests are accepted");
    };
    if (Text.size(uri) == 0 or Text.size(uri) > 500) {
      return #err("Media URI must be between 1 and 500 characters");
    };
    if (not Text.startsWith(uri, #text "icp-media://")) {
      return #err("Media URI must use the icp-media:// scheme");
    };
    if (Text.size(content_hash) < 8 or Text.size(content_hash) > 128) {
      return #err("Content hash must be between 8 and 128 characters");
    };
    if (Text.size(mime_type) == 0 or Text.size(mime_type) > 80) {
      return #err("MIME type must be between 1 and 80 characters");
    };

    let manifest : MediaManifest = {
      id = next_media_manifest_id;
      owner = job.owner;
      job_id;
      attached_by = caller;
      storage_provider;
      uri;
      content_hash;
      mime_type;
      bytes;
      created_at = now();
    };
    next_media_manifest_id += 1;
    media_manifests := append_item<MediaManifest>(media_manifests, manifest);
    record_audit(caller, "media_manifest_attached", Nat.toText(job_id), "provider=" # storage_provider # ";hash=" # content_hash);
    #ok(manifest);
  };

  public shared ({ caller }) func save_to_collection(job_id : Nat, name : Text, is_public : Bool) : async CollectionResult {
    switch (require_authenticated(caller)) {
      case (?err) { return #err(err) };
      case null {};
    };

    let job_index = switch (find_job_index(job_id)) {
      case (?index) { index };
      case null { return #err("Job not found") };
    };
    let job = jobs[job_index];
    if (not Principal.equal(job.owner, caller)) {
      return #err("Only the job owner can save this job");
    };
    if (Text.size(name) == 0 or Text.size(name) > 80) {
      return #err("Collection name must be between 1 and 80 characters");
    };

    let timestamp = now();
    let collection : CollectionRecord = {
      id = next_collection_id;
      owner = caller;
      name;
      job_ids = [job_id];
      is_public;
      created_at = timestamp;
      updated_at = timestamp;
    };
    next_collection_id += 1;
    collections := append_item<CollectionRecord>(collections, collection);
    record_audit(caller, "collection_saved", Nat.toText(collection.id), "job=" # Nat.toText(job_id));
    #ok(collection);
  };

  public shared query ({ caller }) func list_my_jobs() : async [GenerationJob] {
    var result : [GenerationJob] = [];
    for (job in jobs.vals()) {
      if (Principal.equal(job.owner, caller)) {
        result := append_item<GenerationJob>(result, job);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_collections() : async [CollectionRecord] {
    var result : [CollectionRecord] = [];
    for (collection in collections.vals()) {
      if (Principal.equal(collection.owner, caller)) {
        result := append_item<CollectionRecord>(result, collection);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_audit_events() : async [AuditEvent] {
    var result : [AuditEvent] = [];
    for (event in audit_events.vals()) {
      if (Principal.equal(event.caller, caller)) {
        result := append_item<AuditEvent>(result, event);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_payment_intents() : async [PaymentIntent] {
    var result : [PaymentIntent] = [];
    for (intent in payment_intents.vals()) {
      if (Principal.equal(intent.owner, caller)) {
        result := append_item<PaymentIntent>(result, intent);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_worker_grants() : async [WorkerGrant] {
    var result : [WorkerGrant] = [];
    for (grant in worker_grants.vals()) {
      if (Principal.equal(grant.owner, caller) or Principal.equal(grant.worker, caller)) {
        result := append_item<WorkerGrant>(result, grant);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_worker_runs() : async [WorkerRun] {
    var result : [WorkerRun] = [];
    for (run in worker_runs.vals()) {
      if (Principal.equal(run.owner, caller) or Principal.equal(run.worker, caller)) {
        result := append_item<WorkerRun>(result, run);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_ad_credit_grants() : async [AdCreditGrant] {
    var result : [AdCreditGrant] = [];
    for (grant in ad_credit_grants.vals()) {
      if (Principal.equal(grant.owner, caller)) {
        result := append_item<AdCreditGrant>(result, grant);
      };
    };
    result;
  };

  public shared query ({ caller }) func list_my_media_assets() : async [MediaAsset] {
    var result : [MediaAsset] = [];
    for (asset in media_assets.vals()) {
      if (Principal.equal(asset.owner, caller) or Principal.equal(asset.stored_by, caller)) {
        result := append_item<MediaAsset>(result, asset);
      };
    };
    result;
  };

  public shared query ({ caller }) func get_media_asset(asset_id : Nat) : async ?MediaAsset {
    for (asset in media_assets.vals()) {
      if (asset.id == asset_id and (Principal.equal(asset.owner, caller) or Principal.equal(asset.stored_by, caller))) {
        return ?asset;
      };
    };
    null;
  };

  public shared query ({ caller }) func list_my_media_manifests() : async [MediaManifest] {
    var result : [MediaManifest] = [];
    for (manifest in media_manifests.vals()) {
      if (Principal.equal(manifest.owner, caller) or Principal.equal(manifest.attached_by, caller)) {
        result := append_item<MediaManifest>(result, manifest);
      };
    };
    result;
  };

  public query func get_cycle_note() : async Text {
    "Local prototype: monitor and top up cycles before any isolated mainnet preview. Production deployments need backup controllers and a higher freezing threshold.";
  };
}
