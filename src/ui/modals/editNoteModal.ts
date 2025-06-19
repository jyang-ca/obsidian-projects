import { App, Modal } from "obsidian";

import type { DataField, DataRecord } from "src/lib/dataframe/dataframe";

import EditRecord from "./components/EditNote.svelte";

export class EditNoteModal extends Modal {
  component?: EditRecord;

  constructor(
    app: App,
    readonly fields: DataField[],
    readonly onSave: (record: DataRecord) => void,
    readonly defaults: DataRecord
  ) {
    super(app);
    console.log("EditNoteModal constructor called");
    console.log("Fields:", JSON.stringify(fields, null, 2));
    console.log("Defaults:", JSON.stringify(defaults, null, 2));
  }

  onOpen() {
    console.log("EditNoteModal onOpen called");
    this.component = new EditRecord({
      target: this.contentEl,
      props: {
        record: this.defaults,
        fields: this.fields,
        onSave: (record: DataRecord) => {
          console.log("EditNoteModal onSave called with record:", JSON.stringify(record, null, 2));
          this.onSave(record);
          this.close();
        },
      },
    });
  }

  onClose() {
    console.log("EditNoteModal onClose called");
    if (this.component) {
      this.component.$destroy();
    }
  }
}
