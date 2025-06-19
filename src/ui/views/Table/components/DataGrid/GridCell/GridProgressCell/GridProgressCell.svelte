<script lang="ts">
  import GridCell from "../GridCell.svelte";
  import NumberInput from "../GridNumberCell/NumberInput.svelte";
  import { type Optional } from "src/lib/dataframe/dataframe";
  import type { GridColDef } from "../../dataGrid";

  export let value: Optional<number>;
  export let onChange: (value: Optional<number>) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  let edit: boolean = false;

  function handleProgressChange(value: number) {
    // Clamp value between 0 and 100 for progress fields
    const clampedValue = Math.round(Math.min(Math.max(value, 0), 100));
    onChange(clampedValue);
  }
</script>

<GridCell
  bind:edit
  bind:selected
  {column}
  on:mousedown
  on:navigate
  {rowindex}
  {colindex}
  onCopy={() => {
    navigator.clipboard.writeText(value?.toString() || "");
  }}
  onCut={() => {
    navigator.clipboard.writeText(value?.toString() || "");
    onChange(undefined);
  }}
  onPaste={async () => {
    const pastedValue = parseFloat(await navigator.clipboard.readText());
    handleProgressChange(pastedValue);
  }}
>
  <svelte:fragment slot="read">
    {#if value !== null && value !== undefined}
      <div class="progress-label">
        {value}%
      </div>
    {/if}
  </svelte:fragment>
  <NumberInput
    slot="edit"
    on:blur={(event) => {
      if (
        event.currentTarget instanceof HTMLInputElement &&
        event.relatedTarget instanceof HTMLDivElement &&
        !event.relatedTarget.contains(event.currentTarget)
      ) {
        selected = false;
        edit = false;
      }
    }}
    value={value ?? 0}
    onChange={(value) => {
      handleProgressChange(value ?? 0);
    }}
  />
</GridCell>

<style>
  .progress-label {
    width: 100%;
    padding: 6px;
    text-align: right;
    font-weight: 500;
  }
</style> 