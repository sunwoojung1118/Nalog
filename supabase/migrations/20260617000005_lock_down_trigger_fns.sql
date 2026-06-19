-- Revoke PostgREST RPC access from trigger/event-trigger helper functions.
-- These are invoked by Postgres internals only; exposing them via
-- /rest/v1/rpc/... has no legitimate use and was flagged by the advisor.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
