# Soleman Elementor Animate Hue

為 Elementor **Container** 加入動態 mesh／liquid 光影（Hue）覆蓋層效果。效果疊在既有背景之上，不取代原本的背景色或背景圖。

- **作者：** [Soleman](https://soleman.tw)
- **版本：** 1.2.0
- **授權：** GPL-2.0-or-later
- **需求：** WordPress 6.0+、PHP 7.4+、Elementor 3.16+

---

## 功能特色

- 僅擴充 **Container** 的「進階」分頁，新增 **Animation Hue** 區塊
- 可自訂 2～10 個混色色票
- 以滑桿調整速度、不透明度、混合模式
- 進階參數：光斑數量、柔邊程度、光斑大小、移動幅度
- 效果以覆蓋層方式呈現，內容層級維持在光影之上
- 動畫採 compositor-friendly 的 `transform`，並在離屏時自動暫停
- 內建除錯面板，方便檢查設定與前端效能

---

## 安裝方式

1. 下載或 clone 此外掛資料夾 `soleman-elementor-animate-hue`
2. 上傳至 WordPress 的 `wp-content/plugins/`
3. 在後台「外掛」啟用 **Soleman Elementor Animate Hue**
4. 確認已啟用 **Elementor**（必要相依）

```bash
# 範例：以 git 安裝
cd wp-content/plugins
git clone https://github.com/tim90403/soleman-elementor-animate-hue.git
```

---

## 使用方式

1. 以 Elementor 編輯頁面
2. 選取任一 **Container**
3. 開啟右側面板 → **進階（Advanced）** → **Animation Hue**
4. 開啟 **Enable**
5. 依需求調整顏色與參數後儲存／發布

效果會以半透明光斑層覆蓋在 Container 背景上，並持續緩慢交融移動。

---

## 控制項說明

| 控制項 | 說明 |
|--------|------|
| **Enable** | 啟用／關閉效果 |
| **Hue Colors** | 混入的顏色（Repeater，最少 2、最多 10） |
| **Speed** | 動畫速度（1–100，數值愈高愈快） |
| **Opacity** | 覆蓋層不透明度（0–1） |
| **Blend Mode** | CSS 混合模式（如 Soft Light、Overlay、Screen 等） |
| **Blob Count** | 光斑數量（2–12） |
| **Blur / Softness** | 漸層柔邊程度（對應 GPU 友善的 soft edge，非每幀 `filter:blur`） |
| **Blob Size** | 光斑相對大小（20–150） |
| **Motion Intensity** | 光斑移動幅度（10–100） |
| **Debug Panel** | 顯示除錯面板（亦可使用網址參數） |

---

## 除錯面板

除錯面板會記錄初始化、渲染、光斑建立、可視範圍暫停／恢復與耗時，並顯示 FPS。

### 開啟方式

- 在 Animation Hue 中開啟 **Debug Panel**，或
- 於頁面網址加上：`?sm_ah_debug=1`

範例：

```text
https://example.com/your-page/?sm_ah_debug=1
```

### 面板操作

- **Copy log**：複製純文字紀錄
- **Export JSON**：複製 JSON 格式紀錄
- **Clear**：清空紀錄
- 可拖曳、收合面板

> 提醒：除錯模式本身會增加一點前端開銷，正式環境建議關閉。

---

## 效能說明

- **伺服器端：** 幾乎無額外負擔，僅多輸出 Elementor `data-settings` 相關資料
- **瀏覽器端：** 主要成本來自光斑數量、容器尺寸與混合模式
- 動畫只使用 `transform`，Blur 滑桿對應漸層柔邊
- Container 離開可視範圍時會自動暫停動畫

建議：

- 全寬大區塊可先從 4～6 個光斑、中等 Softness 測試
- 同頁面避免過多 Container 同時啟用高光斑數

---

## 檔案結構

```text
soleman-elementor-animate-hue/
├── soleman-elementor-animate-hue.php
├── includes/
│   ├── class-plugin.php      # 外掛啟動與 Elementor 檢查
│   ├── class-controls.php    # Animation Hue 控制項
│   └── class-frontend.php    # 前端資源與 render 屬性
├── assets/
│   ├── css/animate-hue.css
│   └── js/animate-hue.js
└── README.md
```

---

## 相容性

- **必要：** Elementor
- **不衝突目標：** JetWoo Builder、Pro Elements（不主動相依）
- 目前僅支援 **Container**（不包含 Section／Column／一般 Widget）

---

## 授權

GPL-2.0-or-later  
Copyright © Soleman（https://soleman.tw）
