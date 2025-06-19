<script lang="ts">
  // import { DateInput } from "obsidian-svelte";
  import { isDate } from "src/lib/dataframe/dataframe";
  import DateInput from "src/ui/components/DateInput.svelte";
  import type { Optional } from "src/lib/dataframe/dataframe";
  import dayjs from "dayjs";

  import { GridCell } from "..";
  import { TextLabel } from "..";
  import type { GridColDef } from "../../dataGrid";

  export let value: Optional<Date>;
  let cachedValue: Optional<Date> = value; // store the proposing value
  export let onChange: (value: Optional<Date>) => void;
  export let column: GridColDef;
  export let rowindex: number;
  export let colindex: number;
  export let selected: boolean;

  let edit = false;

  function formatDday(date: Date | string): string {
    const today = dayjs().startOf('day');
    const targetDate = dayjs(date).startOf('day');
    const diff = targetDate.diff(today, 'day');
    
    if (diff === 0) return "D-Day";
    if (diff < 0) return `D+${Math.abs(diff)}`;
    return `D-${diff}`;
  }

  $: isDdayField = column.typeConfig?.isDday;
</script>

<GridCell
  {selected}
  {rowindex}
  {colindex}
  {edit}
  onEditChange={(mode) => {
    edit = mode;
  }}
  {column}
  on:mousedown
  on:navigate
  onCopy={() => {
    if (value) {
      navigator.clipboard.writeText(
        new Intl.DateTimeFormat("default", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }).format(value)
      );
    }
  }}
>
  <svelte:fragment slot="read">
    {#if value}
      <div class="date-container">
        <TextLabel
          value={new Intl.DateTimeFormat("default", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
          }).format(value)}
        />
        {#if isDdayField}
          <div class="dday" class:overdue={dayjs(value).isBefore(dayjs(), 'day')}>
            {formatDday(value)}
          </div>
        {/if}
      </div>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="edit">
    <DateInput
      value={value ?? null}
      on:change={({ detail }) => (cachedValue = detail)}
      on:blur={() => {
        edit = false;
        if (!cachedValue || !isDate(value)) {
          onChange(cachedValue);
          return;
        }
        const cachedDate = dayjs(cachedValue);
        const newDatetime = dayjs(value)
          .set("year", cachedDate.year())
          .set("month", cachedDate.month())
          .set("date", cachedDate.date());
        onChange(newDatetime.toDate());
      }}
      embed
    />
  </svelte:fragment>
</GridCell>

<style>
  .date-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
  }

  .dday {
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
    text-align: center;
  }

  .dday.overdue {
    color: var(--text-error);
  }
</style>
