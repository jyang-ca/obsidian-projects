import { get } from "svelte/store";

import type {
  DataField,
  DataRecord,
  DataValue,
  Optional,
} from "./dataframe/dataframe";
import type { DataApi } from "./dataApi";
import { dataFrame } from "./stores/dataframe";
import type { DataSource } from "./datasources";

/**
 * ViewApi provides an write API for views.
 */
export class ViewApi {
  constructor(readonly dataSource: DataSource, readonly dataApi: DataApi) {}

  addRecord(record: DataRecord, fields: DataField[], templatePath: string) {
    if (this.dataSource.includes(record.id)) {
      dataFrame.addRecord(record);
    }
    this.dataApi.createNote(record, fields ?? [], templatePath);
  }

  async updateRecord(record: DataRecord, fields: DataField[]) {
    console.log("ViewApi updateRecord called");
    console.log("Record:", JSON.stringify(record, null, 2));
    console.log("Fields:", JSON.stringify(fields, null, 2));
    
    const progressField = fields.find(field => field.type === 'progress');
    if (progressField) {
      console.log("Progress field found:", progressField.name);
      console.log("Progress value in record:", record.values[progressField.name]);
    }
    
    if (this.dataSource.includes(record.id)) {
      console.log("Updating record in dataFrame store");
      dataFrame.updateRecord(record);
      
      // dataFrame 스토어 상태 확인
      const currentFrame = get(dataFrame);
      console.log("DataFrame after update:", {
        recordCount: currentFrame.records.length,
        progressValues: currentFrame.records
          .filter(r => progressField && typeof r.values[progressField.name] === 'number')
          .map(r => ({ id: r.id, value: r.values[progressField?.name || ''] }))
      });
    }
    await this.dataApi.updateRecord(fields, record);
    console.log("ViewApi updateRecord completed");
  }

  async updateRecords(records: DataRecord[], fields: DataField[]) {
    const rs = records.filter((r) => this.dataSource.includes(r.id));
    if (rs) dataFrame.updateRecords(rs);
    await this.dataApi.updateRecords(fields, records);
  }

  deleteRecord(recordId: string) {
    if (this.dataSource.includes(recordId)) {
      dataFrame.deleteRecord(recordId);
    }
    this.dataApi.deleteRecord(recordId);
  }

  addField(field: DataField, value: Optional<DataValue>, position?: number) {
    dataFrame.addField(field, position);

    this.dataApi.addField(
      get(dataFrame).records.map((record) => record.id),
      field,
      value
    );
  }

  updateField(field: DataField, oldName?: string) {
    dataFrame.updateField(field, oldName);

    if (oldName) {
      this.dataApi.renameField(
        get(dataFrame).records.map((record) => record.id),
        oldName,
        field.name
      );
    }
  }

  deleteField(field: string) {
    dataFrame.deleteField(field);
    this.dataApi.deleteField(
      get(dataFrame).records.map((record) => record.id),
      field
    );
  }
}
