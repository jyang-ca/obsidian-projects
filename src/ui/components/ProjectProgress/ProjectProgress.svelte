<script lang="ts">
  import { Progress } from "obsidian-svelte";
  import type { DataFrame } from "src/lib/dataframe/dataframe";
  import { DataFieldType } from "src/lib/dataframe/dataframe";

  export let frame: DataFrame;

  $: ({ fields, records } = frame);

  $: progressField = fields.find(field => field.type === DataFieldType.Progress);
  
  $: progress = progressField ? records.reduce((acc, record) => {
    const value = record.values[progressField.name];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0) / (records.length || 1) : 0;
</script>

{#if progressField}
  <div class="progress-container">
    <Progress value={progress} />
    <span class="progress-text">{Math.round(progress * 100)}%</span>
  </div>
{/if}

<style>
  .progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 200px;
  }

  .progress-text {
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
    min-width: 48px;
  }
</style> 