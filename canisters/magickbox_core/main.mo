import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

persistent actor {
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

  var profiles : [Profile] = [];
  var jobs : [GenerationJob] = [];
  var collections : [CollectionRecord] = [];
  var audit_events : [AuditEvent] = [];
  var next_job_id : Nat = 1;
  var next_collection_id : Nat = 1;
  var next_audit_id : Nat = 1;

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

  public shared ({ caller }) func complete_mock_job(job_id : Nat, result_url : Text, result_hash : Text) : async JobResult {
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
      return #err("Only the job owner can complete the mock job");
    };
    if (Text.size(result_url) == 0 or Text.size(result_url) > 500) {
      return #err("Result URL must be between 1 and 500 characters");
    };
    if (Text.size(result_hash) < 8 or Text.size(result_hash) > 128) {
      return #err("Result hash must be between 8 and 128 characters");
    };

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
      updated_at = now();
    };
    replace_job(job_index, updated);
    record_audit(caller, "generation_job_completed", Nat.toText(job_id), "mock worker completion");
    #ok(updated);
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

  public query func get_cycle_note() : async Text {
    "Local prototype: monitor and top up cycles before any isolated mainnet preview. Production deployments need backup controllers and a higher freezing threshold.";
  };
}
