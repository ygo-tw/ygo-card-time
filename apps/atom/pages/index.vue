<template>
  <div class="flex flex-col gap-4 p-4">
    <Button label="Button" class="w-48" />
    <Button label="Button Unstyled" class="w-48" unstyled />

    <ToggleSwitch v-model="checked1" />

    <!-- Dialog 範例 -->
    <div class="border border-primary-200 p-4 rounded-lg">
      <h3 class="custom-title-m mb-4">Dialog 範例</h3>
      <div class="flex gap-2 flex-wrap">
        <Button label="基本 Dialog" @click="showBasicDialog = true" />
        <Button
          label="表單 Dialog"
          severity="success"
          @click="showFormDialog = true"
        />
        <Button
          label="全螢幕 Dialog"
          severity="info"
          @click="showFullscreenDialog = true"
        />
      </div>
    </div>

    <!-- 基本 Dialog -->
    <Dialog
      v-model:visible="showBasicDialog"
      modal
      header="基本對話框"
      :style="{ width: '25rem' }"
    >
      <p class="custom-body-m mb-4">這是一個基本的對話框範例。</p>
      <p class="custom-body-s text-primary-600">您可以在這裡放置任何內容。</p>

      <template #footer>
        <Button
          label="取消"
          severity="secondary"
          @click="showBasicDialog = false"
        />
        <Button label="確定" @click="showBasicDialog = false" />
      </template>
    </Dialog>

    <!-- 表單 Dialog -->
    <Dialog
      v-model:visible="showFormDialog"
      modal
      header="新增用戶"
      :style="{ width: '30rem' }"
    >
      <div class="space-y-4">
        <div>
          <label class="custom-label-m block mb-2">姓名</label>
          <InputText
            v-model="formData.name"
            placeholder="請輸入姓名"
            class="w-full"
          />
        </div>
        <div>
          <label class="custom-label-m block mb-2">電子郵件</label>
          <InputText
            v-model="formData.email"
            placeholder="請輸入電子郵件"
            class="w-full"
          />
        </div>
        <div>
          <label class="custom-label-m block mb-2">角色</label>
          <Dropdown
            v-model="formData.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            placeholder="選擇角色"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="取消"
          severity="secondary"
          @click="showFormDialog = false"
        />
        <Button label="儲存" @click="handleSaveForm" />
      </template>
    </Dialog>

    <!-- 全螢幕 Dialog -->
    <Dialog
      v-model:visible="showFullscreenDialog"
      modal
      header="全螢幕對話框"
      :maximizable="true"
      :style="{ width: '75vw' }"
    >
      <div class="space-y-4">
        <p class="custom-body-m">這是一個大對話框。</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border border-primary-200 rounded">
            <h4 class="custom-title-s mb-2">區塊 1</h4>
            <p class="custom-body-s">內容內容內容內容...</p>
          </div>
          <div class="p-4 border border-primary-200 rounded">
            <h4 class="custom-title-s mb-2">區塊 2</h4>
            <p class="custom-body-s">內容內容內容內容...</p>
          </div>
        </div>
        <div class="scroll border w-full h-[200px] p-4">
          <p class="text-primary-950">primary 950</p>
          <p class="text-primary-900">primary 900</p>
          <p class="text-primary-800">primary 800</p>
          <p class="text-primary-700">primary 700</p>
          <p class="text-primary-600">primary 600</p>
          <p class="text-primary-500">primary 500</p>
          <p class="text-primary-400">primary 400</p>
          <p class="text-primary-300">primary 300</p>
          <p class="text-primary-200">primary 200</p>
          <p class="text-primary-100">primary 100</p>
          <p class="text-primary-50">primary 50</p>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" @click="showFullscreenDialog = false" />
      </template>
    </Dialog>

    <div>
      <p style="font-weight: 400">Regular 字體</p>
      <p style="font-weight: 500">Medium 字體</p>
      <p style="font-weight: 700">Bold 字體</p>
    </div>

    <div>
      <p class="custom-title-l">標題 L</p>
      <p class="custom-title-m">標題 M</p>
      <p class="custom-title-s">標題 S</p>
      <p class="custom-body-l">內文 L</p>
      <p class="custom-body-m">內文 M</p>
      <p class="custom-body-s">內文 S</p>
      <p class="custom-button-l">按鈕 L</p>
    </div>

    <div class="pc">桌機版</div>
    <div class="mobile">手機版</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'HomePage',
});

const checked1 = ref(false);

// Dialog 狀態
const showBasicDialog = ref(false);
const showFormDialog = ref(false);
const showFullscreenDialog = ref(false);

// 表單資料
const formData = ref({
  name: '',
  email: '',
  role: null,
});

// 角色選項
const roleOptions = [
  { label: '管理員', value: 'admin' },
  { label: '編輯者', value: 'editor' },
  { label: '檢視者', value: 'viewer' },
];

// 處理表單儲存
const handleSaveForm = () => {
  console.log('表單資料:', formData.value);
  showFormDialog.value = false;
  // 重置表單
  formData.value = {
    name: '',
    email: '',
    role: null,
  };
};
</script>
