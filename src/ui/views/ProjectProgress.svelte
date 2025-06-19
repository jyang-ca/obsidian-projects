<script lang="ts">
  import { Typography } from "obsidian-svelte";
  import type { DataField, DataRecord } from "src/lib/dataframe/dataframe";
  import { DataFieldType } from "src/lib/dataframe/dataframe";
  import { i18n } from "src/lib/stores/i18n";
  import { dataFrame } from "src/lib/stores/dataframe";

  export let fields: DataField[];
  export let records: DataRecord[];

  // dataFrame 스토어를 구독하여 실시간 업데이트 감지
  $: frameData = $dataFrame;
  
  // frameData의 records를 우선 사용하되, 없으면 props의 records 사용
  $: currentRecords = frameData.records.length > 0 ? frameData.records : records;
  $: currentFields = frameData.fields.length > 0 ? frameData.fields : fields;
  
  $: progressField = currentFields.find(field => field.type === DataFieldType.Progress);
  
  // 반응성을 개선하여 progressField와 records가 변경될 때마다 재계산
  $: progress = calculateProgress(progressField, currentRecords);
  
  // progress 값이 변경될 때마다 로그 출력
  $: console.log('ProjectProgress - progress value changed:', progress);
  
  $: if (progressField) {
    console.log('ProjectProgress Debug:', {
      progressField: progressField.name,
      progress,
      currentRecords: currentRecords.map(r => ({ id: r.id, value: r.values[progressField.name] })),
      frameRecords: frameData.records.length,
      propsRecords: records.length
    });
  }

  function calculateProgress(field: DataField | undefined, recordList: DataRecord[]): number {
    console.log("calculateProgress called");
    console.log("field:", field?.name, field?.type);
    console.log("recordList.length:", recordList.length);
    
    if (!field || !recordList.length) {
      console.log("Early return: no field or no records");
      return 0;
    }
    
    const progressValues = recordList
      .map(record => {
        const value = record.values[field.name];
        console.log(`Record ${record.id}: ${field.name} = ${value} (type: ${typeof value})`);
        return value;
      })
      .filter(value => {
        const isValid = value !== null && value !== undefined && typeof value === 'number';
        console.log(`Value ${value} is valid: ${isValid}`);
        return isValid;
      })
      .map(value => {
        const clamped = Math.min(Math.max(value as number, 0), 100);
        console.log(`Clamped ${value} to ${clamped}`);
        return clamped;
      });
    
    if (progressValues.length === 0) {
      console.log("No valid progress values found");
      return 0;
    }
    
    const sum = progressValues.reduce((a, b) => a + b, 0);
    const average = sum / progressValues.length;

    return average;
  }
</script>

<div class="progress-container">
  <Typography variant="label" nomargin>
    {$i18n.t("views.project.progress.title")}
  </Typography>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {Math.max(1, Math.min(100, progress || 0))}%" />
  </div>
  <div class="progress-text">
    <Typography variant="body">
      {(progress || 0).toFixed(1)}%
    </Typography>
  </div>
</div>

<style>
  .progress-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-2-1) var(--size-4-3);
    background: var(--background-secondary);
    margin-bottom: var(--size-4-2);
    gap: var(--size-4-2);
  }

  .progress-bar {
    height: 12px;
    background: var(--background-modifier-border);
    border-radius: 6px;
    overflow: hidden;
    margin: var(--size-2-1) 0;
    flex: 1;
    min-width: 100px;
    border: 1px solid var(--background-modifier-border-hover);
    position: relative;
  }

  .progress-text {
    width: 50px;
    text-align: right;
    flex-shrink: 0;
  }

  .progress-fill {
    height: 100%;
    background: #6366f1;
    opacity: 0.7;
    background-size: 200% 200%;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
    position: absolute;
    top: 0;
    left: 0;
    min-width: 2px;
  }

  @keyframes progressGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .debug-info {
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
    margin-left: var(--size-2-1);
  }
</style> 