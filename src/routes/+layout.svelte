<script lang="ts">
import "../app.css";
import Confirm from "@/components/dialog/dialog.svelte";
import { mode, ModeWatcher } from "mode-watcher";
import { Toaster } from "svelte-sonner";
const { children } = $props();
</script>

<Confirm />
<ModeWatcher />
<Toaster theme={$mode} duration={8000} />
{@render children()}
