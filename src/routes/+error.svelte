<script lang="ts">
import { page } from "$app/stores";
</script>

<main class="error-page">
	<h1>{$page.status}</h1>
	{#if $page.state !== 404}
		<p>{$page.error?.message ?? "Something went wrong"}</p>
	{/if}
</main>

<style>
.error-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100dvh;
	text-align: center;
	/* background-color: #f8d7da;
		color: #721c24; */
}

h1 {
	font-size: 3rem;
	margin: 0;
}

p {
	font-size: 1.5rem;
}
</style>
