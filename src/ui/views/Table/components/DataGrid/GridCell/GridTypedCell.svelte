<script lang="ts">
  import {
    isOptionalBoolean,
    isOptionalDate,
    isOptionalList,
    isOptionalNumber,
    isOptionalString,
    type Optional,
    type DataValue,
  } from "src/lib/dataframe/dataframe";

  import GridCell from "./GridCell.svelte";

  import type { GridColDef } from "../dataGrid";
  import { GridBooleanCell } from "./GridBooleanCell";
  import { GridDateCell } from "./GridDateCell";
  import { GridDatetimeCell } from "./GridDatetimeCell";
  import { GridNumberCell } from "./GridNumberCell";
  import GridProgressCell from "./GridProgressCell/GridProgressCell.svelte";
  import { GridTextCell } from "./GridTextCell";
  import { GridListCell } from "./GridListCell";

  export let value: Optional<DataValue>;
  export let onChange: (value: Optional<DataValue>) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  // Helper function to safely convert value to number for progress
  function getProgressValue(val: Optional<DataValue>): Optional<number> {
    if (val === null || val === undefined) return val;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
</script>

{#if column.repeated && isOptionalList(value)}
  <GridListCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "string" && isOptionalString(value)}
  <GridTextCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "boolean" && isOptionalBoolean(value)}
  <GridBooleanCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "number" && isOptionalNumber(value)}
  <GridNumberCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "progress"}
  <GridProgressCell
    {selected}
    {rowindex}
    {colindex}
    value={getProgressValue(value)}
    onChange={(newValue) => onChange(newValue)}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "date" && column.typeConfig?.time && isOptionalDate(value)}
  <GridDatetimeCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else if column.type === "date" && isOptionalDate(value)}
  <GridDateCell
    {selected}
    {rowindex}
    {colindex}
    {value}
    {onChange}
    {column}
    on:mousedown
    on:navigate
  />
{:else}
  <GridCell
    {selected}
    {rowindex}
    {colindex}
    {column}
    on:mousedown
    on:navigate
  />
{/if}
