<script lang="ts">
  import { produce } from "immer";
  import {
    Button,
    Callout,
    ModalButtonGroup,
    ModalContent,
    ModalLayout,
    SettingItem,
    Typography,
  } from "obsidian-svelte";

  import { FieldControl } from "src/ui/components/FieldControl";
  import type { DataField, DataRecord } from "src/lib/dataframe/dataframe";
  import { i18n } from "src/lib/stores/i18n";

  export let fields: DataField[];
  export let record: DataRecord;

  console.log("EditNote component mounted");
  console.log("Fields:", JSON.stringify(fields, null, 2));
  console.log("Record:", JSON.stringify(record, null, 2));

  $: editableFields = fields.filter((field) => !field.derived);
  console.log("Editable fields:", JSON.stringify(editableFields, null, 2));

  export let onSave: (record: DataRecord) => void;

  function handleFieldChange(field: DataField, value: any) {
    console.log("Field value changing:", field.name, value);
    console.log("Field type:", field.type);
    console.log("Field typeConfig:", JSON.stringify(field.typeConfig, null, 2));
    record = produce(record, (draft) => {
      // @ts-ignore
      draft.values[field.name] = value;
    });
  }
</script>

<ModalLayout title={$i18n.t("modals.note.edit.title")}>
  {#if !editableFields.length}
    <Callout
      title={$i18n.t("modals.note.edit.no-editable-fields.title")}
      icon="info"
      variant="info"
    >
      <Typography variant="body">
        {$i18n.t("modals.note.edit.no-editable-fields.message")}
      </Typography>
    </Callout>
    <ModalContent>
      {#each fields as field (field.name)}
        {@const fieldValue = record.values[field.name]}
        {@const fieldTypeConfig = field.typeConfig}
        <SettingItem name={field.name}>
          <FieldControl
            {field}
            value={fieldValue}
            onChange={(value) => {
              console.log("Field value changed:", field.name, value);
              record = produce(record, (draft) => {
                // @ts-ignore
                draft.values[field.name] = value;
              });
            }}
            readonly={true}
          />
        </SettingItem>
      {/each}
    </ModalContent>
  {/if}
  <ModalContent>
    {#each editableFields as field (field.name)}
      {@const fieldValue = record.values[field.name]}
      {@const fieldTypeConfig = field.typeConfig}
      <SettingItem name={field.name}>
        <FieldControl
          {field}
          value={fieldValue}
          onChange={(value) => handleFieldChange(field, value)}
        />
      </SettingItem>
    {/each}
  </ModalContent>
  <ModalButtonGroup>
    <Button
      variant="primary"
      on:click={() => {
        onSave(record);
      }}
      >{editableFields.length
        ? $i18n.t("modals.note.edit.save")
        : $i18n.t("modals.note.edit.confirm")}</Button
    >
  </ModalButtonGroup>
</ModalLayout>
