<script lang="ts">
  import {
    Autocomplete,
    // DateInput,
    // DatetimeInput,
    NumberInput,
    Switch,
    TextInput,
  } from "obsidian-svelte";
  import DateInput from "../DateInput.svelte";
  import DatetimeInput from "../DatetimeInput.svelte";
  import dayjs from "dayjs";

  import { TagList } from "src/ui/components/TagList";
  import {
    DataFieldType,
    isBoolean,
    isDate,
    isNumber,
    isOptionalList,
    isProgress,
    isString,
    type DataField,
    type DataValue,
    type Optional,
  } from "src/lib/dataframe/dataframe";

  export let field: DataField;
  export let value: Optional<DataValue>;
  let cachedValue: Optional<Date> = isDate(value) ? value : null; // store the proposing value
  export let onChange: (value: Optional<DataValue>) => void;
  export let readonly: boolean = false;

  $: options =
    field.typeConfig?.options?.map((option) => ({
      label: option,
      description: "",
    })) ?? [];

  function formatDday(date: Date | string): string {
    const today = dayjs().startOf('day');
    const targetDate = dayjs(date).startOf('day');
    const diff = targetDate.diff(today, 'day');
    
    if (diff === 0) return "D-Day";
    if (diff < 0) return `D+${Math.abs(diff)}`;
    return `D-${diff}`;
  }

  function handleProgressChange(value: number) {
    // Clamp value between 0 and 100 for progress fields
    const clampedValue = Math.round(Math.min(Math.max(value, 0), 100));
    onChange(clampedValue);
  }
</script>

{#if field.type === DataFieldType.Boolean}
  <Switch
    checked={isBoolean(value) ? value : false}
    on:check={({ detail }) => onChange(detail)}
  />
{:else if field.repeated && isOptionalList(value)}
  <TagList edit={!readonly} values={value ?? []} {onChange} />
{:else if field.type === DataFieldType.String}
  {#if options.length > 0}
    <Autocomplete
      value={isString(value) ? value : ""}
      {options}
      on:change={({ detail }) => onChange(detail)}
    />
  {:else}
    <TextInput
      value={isString(value) ? value : ""}
      on:input={({ detail: value }) => onChange(value)}
      {readonly}
    />
  {/if}
{:else if field.type === DataFieldType.Number}
  <NumberInput
    value={isNumber(value) ? value : null}
    on:input={({ detail: value }) =>
      onChange(value !== null ? value : undefined)}
  />
{:else if field.type === DataFieldType.Progress}
  <NumberInput
    value={isProgress(value) ? value : 0}
    on:input={({ detail: value }) => handleProgressChange(value ?? 0)}
    {readonly}
  />
{:else if field.type === DataFieldType.Date}
  {#if field.typeConfig?.time}
    <DatetimeInput
      value={isDate(value) ? value : null}
      on:input={({ detail: value }) => (cachedValue = value)}
      on:blur={() => onChange(cachedValue)}
    />
  {:else}
    <DateInput
      value={isDate(value) ? value : null}
      on:change={({ detail: value }) => (cachedValue = value)}
      on:blur={() => {
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
    />
  {/if}
  {#if field.typeConfig?.isDday && isDate(value)}
    <div class="dday" class:overdue={dayjs(value).isBefore(dayjs(), 'day')}>
      {formatDday(value)}
    </div>
  {/if}
{/if}

<style>
  .dday {
    margin-top: 4px;
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
  }

  .dday.overdue {
    color: var(--text-error);
  }
</style>
