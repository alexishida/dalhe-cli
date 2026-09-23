# C/C++ Pattern Guide

Use this file when design or architecture is a material part of the task.

## General rule

A pattern is justified only when it makes an invariant, ownership model, variability point, or performance constraint easier to reason about. Prefer direct code over ceremony.

## C patterns

### Opaque handle
Use a forward-declared struct in the public header and keep representation private in the `.c` file. Good for ABI stability, encapsulation, and reducing recompilation.

### Context object
Pass a context pointer to callbacks instead of using global state. This supports multiple instances, testing, and dependency injection.

### Explicit lifecycle
Prefer `foo_init` / operations / `foo_destroy` where ownership is caller-provided, or `foo_create` / `foo_destroy` where the module owns allocation. Make partial-initialization cleanup valid.

### State machine
Represent states/events explicitly. Prefer a transition table when behavior is regular; prefer a switch when that is clearer. Reject invalid transitions deliberately.

### Tagged union
Pair the union with an enum tag and keep construction/destruction rules centralized. Validate the active tag before reading payload.

### Arena/region allocator
Good when many objects share one lifetime and individual deallocation is unnecessary. Track alignment, capacity, overflow, and reset semantics.

### Intrusive containers
Good when allocation must be controlled and objects naturally participate in a data structure. Document membership and lifetime rules carefully.

### Table-driven dispatch
Useful when branches map naturally to operation descriptors or function tables. Avoid if it obscures a tiny fixed switch.

## C++ patterns

### RAII
Default mechanism for resource management. Wrap file descriptors, handles, mappings, locks, and other resources in deterministic owners.

### Value semantics
Prefer types whose ownership is self-contained and copying/moving has clear meaning. This reduces aliasing and lifetime complexity.

### Strategy
- Compile-time: templates/policies for zero-overhead customization where types are known.
- Runtime: virtual interface or type erasure when behavior changes dynamically.
- Lightweight: function object/lambda for localized strategy injection.

### PImpl
Use for ABI stability, private implementation dependencies, or compile-time isolation. Account for indirection/allocation cost and special member functions.

### Type erasure
Use when callers need a stable non-templated interface over heterogeneous implementations. Be explicit about allocation, SBO, copyability, and exception guarantees.

### CRTP
Use for static polymorphism, mixins, or compile-time interfaces only when it simplifies a real problem. Avoid deep inheritance-like CRTP hierarchies.

### Observer/event
Make subscription ownership explicit. Prevent callbacks into destroyed objects. Prefer tokens/connections with deterministic unsubscription.

### Builder
Useful when construction has many optional fields, ordering constraints, or validation. Avoid for simple aggregates.

### Policy-based design
Useful for low-level libraries with compile-time choices. Keep policy surface small and error diagnostics usable.

### Data-oriented design
Organize hot data around access patterns instead of object taxonomy. Split hot/cold fields, consider SoA, compact IDs, contiguous storage, and batched processing.

## Anti-pattern warnings

Question these when they appear:
- Singleton/global mutable state.
- Shared ownership by default.
- Deep inheritance hierarchies.
- Virtual interfaces for one implementation with no boundary need.
- Abstract factories around trivial constructors.
- Macros replacing normal C++ language mechanisms.
- Clever lock-free code without measured need.
- Custom containers/allocators without a concrete constraint.
- Premature ECS/data-oriented rewrites of cold code.
