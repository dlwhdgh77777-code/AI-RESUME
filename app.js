// PDF.js worker setup
if (window.pdfjsLib) {
  // To avoid cross-origin Web Worker blocking when running via file:// protocol,
  // we fetch the worker script and load it as a local Blob URL.
  const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
  fetch(workerUrl)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
      console.log("PDF.js worker successfully loaded via Blob URL.");
    })
    .catch(error => {
      console.warn("Failed to load PDF.js worker via Blob URL, falling back to direct URL (PDF parsing may run on main thread):", error);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    });
}

// Job templates content
const jobTemplates = {
  frontend: `[직무명: 프론트엔드 개발자 (Front-end Developer)]

[주요 업무]
- 신규 서비스의 웹 프론트엔드 아키텍처 설계 및 개발
- 직관적이고 반응이 빠른 사용자 중심의 UI/UX 구현
- 웹 성능 최적화, 웹 표준 및 웹 접근성 준수
- 백엔드 개발자 및 프로덕트 매이너(PM)와의 유기적 협업

[자격 요건]
- HTML, CSS, JavaScript(ES6+)에 대한 깊은 이해
- React, Vue.js, Next.js 등 최신 프론트엔드 프레임워크 실무 경험 2년 이상
- TypeScript 활용 및 디자인 시스템 설계 경험이 있으신 분
- RESTful API 및 다양한 비동기 데이터 통신 연동 경험
- Git을 이용한 형상 관리 및 애자일 스프린트 협업 경험

[우대 사항]
- 웹성능 측정 도구(Lighthouse, Web Vitals)를 통한 웹 사이트 최적화 경험
- Jest, Cypress 등을 이용한 유닛/통합 테스트 코드 작성 경험
- CSS-in-JS (Styled-Components, Emotion) 또는 TailwindCSS 실무 경험`,

  backend: `[직무명: 백엔드 개발자 (Back-end Developer)]

[주요 업무]
- 핵심 비즈니스 로직 설계, 개발 및 API 구현
- 데이터베이스 아키텍처 설계 및 쿼리 최적화
- 안정적이고 확장 가능한 분산 서버 인프라 구축
- 서비스 모니터링 및 성능 최적화

[자격 요건]
- Java/Spring Boot, Node.js/Express, Python/Django 중 하나 이상의 프레임워크 경험 2년 이상
- RDBMS(MySQL, PostgreSQL) 및 NoSQL(MongoDB, Redis) 설계 및 운영 능력
- RESTful API 아키텍처 및 통신에 대한 깊은 이해
- AWS, GCP 등 클라우드 서비스 환경 경험
- Docker, CI/CD 배포 자동화 파이프라인 경험

[우대 사항]
- 대용량 데이터 처리 및 고부하 트래픽 대응 아키텍처 설계 경험
- Microservice Architecture (MSA) 개발 및 마이그레이션 경험
- 시스템 보안 및 데이터 암호화 표준에 대한 경험`,

  marketing: `[직무명: 퍼포먼스 마케터 (Performance Marketer)]

[주요 업무]
- 다양한 디지털 채널(Google Ads, Meta, Kakao 등) 매체 광고 집행 및 운영
- 유저 획득(User Acquisition) 효율 극대화 및 CAC 단가 최적화
- A/B 테스트 및 데이터 기반 마케팅 성과 대시보드 구축
- 콘텐츠 기획안 도출 및 디자이너와의 커뮤니케이션

[자격 요건]
- 디지털 마케팅 실무 경력 2년 이상인 분
- Google Analytics(GA4), SQL, Tableau 등 데이터 분석 툴 활용 능력
- ROAS 개선 및 전환율(CVR) 극대화를 위한 주도적 테스트 실행 경험
- 논리적 사고 및 정량적/정성적 지표 분석 역량

[우대 사항]
- SQL 쿼리 작성을 통한 직접적인 로우 데이터 마이닝 경험
- 대규모 예산(월 1억 원 이상) 집행 및 효율 개선 성공 포트폴리오
- Growth Hacking 기법 적용 성과 경험`,

  pm: `[직무명: 프로덕트 매니저 (Product Manager / 기획자)]

[주요 업무]
- 서비스 비전 및 프로덕트 로드맵 정의
- 시장 및 고객 조사, 피드백 분석을 통한 핵심 요구사항(PRD) 정의
- 디자이너, 개발자 등 다채널 부서 조율 및 프로젝트 일정 관리 (스프린트 운영)
- 정량 데이터 분석을 통한 지표(KPI) 정의 및 개선 활동

[자격 요건]
- IT 서비스 기획 또는 Product Management 실무 경력 3년 이상
- 복잡한 비즈니스 요구사항을 단순하고 사용자 친화적인 기능 문서로 설계하는 능력
- Figma 등 협업 툴을 활용한 와이어프레임 설계 및 디자인 협업 역량
- 데이터 분석(GA, Amplitude 등)을 기반으로 한 제품 전략 기획력

[우대 사항]
- 스크럼 마스터, 애자일 협업 조직의 리더 경험
- 기술적 이해도(개발 용어, API 구조, 데이터베이스 기초 등)가 높은 분
- 서비스 신규 출시 또는 대규모 리뉴얼 프로젝트 A to Z 총괄 경험`
};

// Application State
let uploadedText = "";
let currentFileName = "";
let analysisHistory = [];
let currentMode = "single";
let bulkQueue = [];
let bulkActiveItemId = null;

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
  // Restore API key from localStorage
  const savedKey = localStorage.getItem("gemini_api_key");
  if (savedKey) {
    document.getElementById("apiKeyInput").value = savedKey;
    updateApiKeyStatus(true);
  } else {
    updateApiKeyStatus(false);
  }

  // Set up PDF Drag and Drop Listeners
  setupDragAndDrop();
  setupBulkDragAndDrop();

  // Load analysis history from localStorage
  loadHistory();
});

// Drag and Drop implementation
function setupDragAndDrop() {
  const dropzone = document.getElementById("pdfDropzone");
  const fileInput = document.getElementById("pdfFileInput");

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleUploadedFile(e.target.files[0]);
    }
  });
}

// Switch between Single and Bulk modes
function switchMode(mode) {
  currentMode = mode;
  const singleTab = document.getElementById("singleTab");
  const bulkTab = document.getElementById("bulkTab");
  const singleContent = document.getElementById("singleModeContent");
  const bulkContent = document.getElementById("bulkModeContent");
  const singleActions = document.getElementById("singleActionButtons");
  const bulkActions = document.getElementById("bulkActionButtons");
  const placeholder = document.getElementById("placeholder");
  const resultsContent = document.getElementById("resultsContent");

  if (mode === "single") {
    singleTab.classList.add("active");
    bulkTab.classList.remove("active");
    singleContent.style.display = "block";
    bulkContent.style.display = "none";
    singleActions.style.display = "grid";
    bulkActions.style.display = "none";
    
    // Restore Single view or hide dashboard if empty
    if (uploadedText) {
      const activeHistoryItem = analysisHistory[0]; // Simple fallback to latest history
      if (activeHistoryItem && activeHistoryItem.payload) {
        renderResults(activeHistoryItem.payload);
      } else {
        placeholder.style.display = "flex";
        resultsContent.classList.remove("active");
      }
    } else {
      placeholder.style.display = "flex";
      resultsContent.classList.remove("active");
    }
  } else {
    singleTab.classList.remove("active");
    bulkTab.classList.add("active");
    singleContent.style.display = "none";
    bulkContent.style.display = "block";
    singleActions.style.display = "none";
    bulkActions.style.display = "grid";
    
    // Show active bulk item result if selected, otherwise show placeholder
    if (bulkActiveItemId !== null) {
      const activeItem = bulkQueue.find(item => item.id === bulkActiveItemId);
      if (activeItem && activeItem.status === "completed" && activeItem.result) {
        renderResults(activeItem.result);
      } else {
        placeholder.style.display = "flex";
        resultsContent.classList.remove("active");
      }
    } else {
      placeholder.style.display = "flex";
      resultsContent.classList.remove("active");
    }
  }
}

// Bulk Drag and Drop Setup
function setupBulkDragAndDrop() {
  const dropzone = document.getElementById("bulkPdfDropzone");
  const fileInput = document.getElementById("bulkPdfFileInput");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleBulkUploadedFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleBulkUploadedFiles(e.target.files);
    }
  });
}

// Handle multiple uploaded files in bulk mode
function handleBulkUploadedFiles(files) {
  for (let i = 0; i < files.length; i++) {
    addFileToBulkQueue(files[i]);
  }
}

// Add a file to bulk queue and start parsing text
function addFileToBulkQueue(file) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    showToast(`${file.name}: PDF 형식의 파일만 업로드할 수 있습니다.`, "error");
    return;
  }

  // Check if file is already in queue
  const duplicate = bulkQueue.find(item => item.file.name === file.name && item.file.size === file.size);
  if (duplicate) {
    showToast(`이미 대기열에 추가된 파일입니다: ${file.name}`, "warning");
    return;
  }

  const itemId = Date.now() + Math.floor(Math.random() * 1000);
  const queueItem = {
    id: itemId,
    file: file,
    text: "",
    status: "reading",
    result: null,
    error: null
  };

  bulkQueue.push(queueItem);
  renderBulkQueue();

  // Asynchronously extract text
  const fileReader = new FileReader();
  fileReader.onload = async function () {
    try {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      let text = "";
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        text += pageText + "\n";
      }

      if (text.trim().length === 0) {
        throw new Error("PDF에서 텍스트를 추출하지 못했습니다. (이미지 스캔본 의심)");
      }

      const item = bulkQueue.find(it => it.id === itemId);
      if (item) {
        item.text = text;
        item.status = "waiting";
      }
    } catch (error) {
      console.error(`PDF Text Extraction failed for ${file.name}:`, error);
      const item = bulkQueue.find(it => it.id === itemId);
      if (item) {
        item.status = "failed";
        item.error = error.message || "텍스트 추출 실패";
      }
      showToast(`${file.name}: 텍스트를 추출하지 못했습니다.`, "error");
    } finally {
      renderBulkQueue();
    }
  };

  fileReader.onerror = function(err) {
    console.error(`FileReader error for ${file.name}:`, err);
    const item = bulkQueue.find(it => it.id === itemId);
    if (item) {
      item.status = "failed";
      item.error = "파일 읽기 실패";
    }
    renderBulkQueue();
  };

  fileReader.readAsArrayBuffer(file);
}

// Render queue table
function renderBulkQueue() {
  const wrapper = document.getElementById("bulkQueueWrapper");
  const countEl = document.getElementById("queueCount");
  const listEl = document.getElementById("bulkQueueList");

  if (!wrapper || !countEl || !listEl) return;

  if (bulkQueue.length === 0) {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "block";
  countEl.innerText = `대기열: ${bulkQueue.length}개 파일`;
  listEl.innerHTML = "";

  const statusMap = {
    waiting: "대기 중",
    reading: "읽는 중",
    analyzing: "분석 중",
    completed: "완료",
    failed: "실패"
  };

  bulkQueue.forEach((item) => {
    const tr = document.createElement("tr");
    if (item.id === bulkActiveItemId) {
      tr.className = "active";
    }
    
    tr.onclick = () => selectBulkQueueItem(item.id);

    const score = item.result ? `${item.result.matchScore}점` : "-";
    const grade = item.result ? item.result.matchGrade : "-";

    tr.innerHTML = `
      <td><span class="bulk-table-filename" title="${item.file.name}">${item.file.name}</span></td>
      <td><span class="status-badge ${item.status}">${statusMap[item.status]}</span></td>
      <td>${score}</td>
      <td>${grade}</td>
      <td>
        <button class="btn-row-remove" onclick="removeBulkQueueItem(${item.id}, event)" title="삭제">✕</button>
      </td>
    `;
    listEl.appendChild(tr);
  });
}

// Remove single item from bulk queue
function removeBulkQueueItem(id, event) {
  if (event) event.stopPropagation(); // Prevent selecting the row
  bulkQueue = bulkQueue.filter(item => item.id !== id);
  if (bulkActiveItemId === id) {
    bulkActiveItemId = null;
    document.getElementById("placeholder").style.display = "flex";
    document.getElementById("resultsContent").classList.remove("active");
  }
  renderBulkQueue();
  updateBulkExportButton();
}

// Clear all bulk queue items
function clearBulkQueue() {
  bulkQueue = [];
  bulkActiveItemId = null;
  document.getElementById("placeholder").style.display = "flex";
  document.getElementById("resultsContent").classList.remove("active");
  document.getElementById("bulkProgressWrapper").style.display = "none";
  renderBulkQueue();
  updateBulkExportButton();
}

// Select a row from the queue to view details on the right dashboard
function selectBulkQueueItem(id) {
  const item = bulkQueue.find(it => it.id === id);
  if (!item) return;

  if (item.status === "completed" && item.result) {
    bulkActiveItemId = id;
    renderBulkQueue(); // Redraw to set active class
    renderResults(item.result);
    showToast(`${item.file.name}의 분석 결과를 렌더링했습니다.`, "success");
  } else if (item.status === "failed") {
    showToast(`분석에 실패한 파일입니다. 오류: ${item.error}`, "error");
  } else if (item.status === "reading" || item.status === "analyzing") {
    showToast("해당 파일은 처리 중입니다. 완료될 때까지 기다려 주세요.", "info");
  } else {
    showToast("분석 시작 버튼을 눌러 AI 이력서 분석을 진행해 주세요.", "info");
  }
}

// Helper to update the Export CSV button disabled status
function updateBulkExportButton() {
  const exportBtn = document.getElementById("exportCsvBtn");
  if (!exportBtn) return;
  const hasCompleted = bulkQueue.some(item => item.status === "completed");
  exportBtn.disabled = !hasCompleted;
}

// Start bulk sequential AI analysis
async function runBulkResumeAnalysis() {
  const apiKey = localStorage.getItem("gemini_api_key");
  const job = document.getElementById("jobText").value.trim();
  const selectedModel = document.getElementById("modelSelect")?.value || "gemini-2.5-flash";

  if (!apiKey) {
    showToast("API 키가 설정되지 않았습니다. 우측 상단에 입력해 주세요.", "warning");
    return;
  }
  if (bulkQueue.length === 0) {
    showToast("대기열에 분석할 PDF 파일이 없습니다. 파일을 업로드해 주세요.", "warning");
    return;
  }
  
  const waitingItems = bulkQueue.filter(item => item.status === "waiting" || item.status === "failed");
  if (waitingItems.length === 0) {
    showToast("대기열에 '대기 중' 또는 '실패' 상태인 파일이 없습니다.", "warning");
    return;
  }

  if (!job) {
    showToast("비교할 채용 공고(직무 기술서)를 입력해주세요.", "warning");
    return;
  }

  // Show progress bar
  const progressWrapper = document.getElementById("bulkProgressWrapper");
  const progressText = document.getElementById("bulkProgressText");
  const progressFill = document.getElementById("bulkProgressFill");
  
  if (progressWrapper) progressWrapper.style.display = "block";
  if (progressText) progressText.innerText = `0 / ${waitingItems.length} 완료 (0%)`;
  if (progressFill) progressFill.style.width = "0%";
  
  // Disable all controls
  setBulkControlsEnabled(false);

  let processedCount = 0;
  const totalToProcess = waitingItems.length;

  for (let i = 0; i < waitingItems.length; i++) {
    const item = waitingItems[i];
    item.status = "analyzing";
    item.error = null;
    item.result = null;
    renderBulkQueue();

    // Construct prompt
    const prompt = `You are a professional recruiting manager and professional career coach.
Analyze the following candidate's Resume against the provided Job Description (JD). 
Perform a comprehensive compatibility matching audit.

Output your results strictly in the specified JSON format. Your output must contain nothing other than the raw JSON itself, ensuring it is a valid JSON. Do not include markdown codeblocks or quotes.
Translate all analysis text (fitTitle, fitDescription, competencies, strengths, weaknesses, improvements, interviewQuestions) into clean, encouraging, and highly professional Korean.

JSON Schema:
{
  "matchScore": <number between 0 and 100>,
  "matchGrade": <string, one of: "HIGH", "MID", "LOW">,
  "fitTitle": <string, short summary phrase like "프론트엔드 직무 우수 부합">,
  "fitDescription": <string, overall assessment paragraph (2-3 sentences)>,
  "competencies": [
    {"name": <string, e.g. "React 실무 기술">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "성능 최적화">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "협업/프로젝트 관리">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "백엔드 아키텍처">, "score": <number between 0 and 100>}
  ],
  "strengths": [
    <string, strength 1>,
    <string, strength 2>,
    <string, strength 3>
  ],
  "weaknesses": [
    <string, gap/weakness 1>,
    <string, gap/weakness 2>
  ],
  "improvements": [
    {
      "title": <string, item title to improve>,
      "original": <string, a snippet or theme from the resume showing weak impact or poor expression>,
      "suggested": <string, a concrete rewritten example with action verbs and quantifiable results>
    },
    {
      "title": <string, item title to improve>,
      "original": <string, another weak resume snippet>,
      "suggested": <string, recommended rewrite example>
    }
  ],
  "interviewQuestions": [
    {
      "question": <string, highly specific behavioral interview question generated from the resume and JD gaps>,
      "tip": <string, actionable advice on how the candidate should answer this question based on their credentials>
    },
    {
      "question": <string, second interview question>,
      "tip": <string, advice for second question>
    },
    {
      "question": <string, third interview question>,
      "tip": <string, advice for third question>
    }
  ]
}

---
Candidate Resume:
${item.text}

---
Job Description:
${job}
`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || "API call failed");
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!resultText) {
        throw new Error("분석 결과를 받지 못했습니다.");
      }

      // Clean JSON response
      let cleanedText = resultText.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      const analysisResult = JSON.parse(cleanedText);
      item.result = analysisResult;
      item.status = "completed";
      
      // Auto-display the first completed item's dashboard if none is currently active
      if (bulkActiveItemId === null) {
        bulkActiveItemId = item.id;
        renderResults(analysisResult);
      }
    } catch (error) {
      console.error(`Gemini API Error for ${item.file.name}:`, error);
      item.status = "failed";
      item.error = error.message || "분석 오류 발생";
    } finally {
      processedCount++;
      const percent = Math.round((processedCount / totalToProcess) * 100);
      if (progressText) progressText.innerText = `${processedCount} / ${totalToProcess} 완료 (${percent}%)`;
      if (progressFill) progressFill.style.width = `${percent}%`;
      renderBulkQueue();
      updateBulkExportButton();
    }

    // Sleep for 1500ms to prevent API Rate Limit (429)
    if (i < waitingItems.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Re-enable controls
  setBulkControlsEnabled(true);
  showToast("대량 AI 이력서 분석이 모두 완료되었습니다!", "success");
}

// Enable/Disable controls during analysis
function setBulkControlsEnabled(enabled) {
  const bulkBtn = document.getElementById("bulkAnalyzeBtn");
  const fileInput = document.getElementById("bulkPdfFileInput");
  const singleTab = document.getElementById("singleTab");
  const bulkTab = document.getElementById("bulkTab");
  const jobText = document.getElementById("jobText");
  const apiKeyInput = document.getElementById("apiKeyInput");

  if (bulkBtn) bulkBtn.disabled = !enabled;
  if (fileInput) fileInput.disabled = !enabled;
  if (singleTab) singleTab.disabled = !enabled;
  if (bulkTab) bulkTab.disabled = !enabled;
  if (jobText) jobText.disabled = !enabled;
  if (apiKeyInput) apiKeyInput.disabled = !enabled;
  
  // Disable clear queue button
  const clearBtn = document.querySelector(".btn-clear-queue");
  if (clearBtn) clearBtn.disabled = !enabled;
  
  // Disable delete buttons in table
  const removeBtns = document.querySelectorAll(".btn-row-remove");
  removeBtns.forEach(btn => btn.disabled = !enabled);
}

// Export bulk screening results to Excel-compatible CSV file
function exportBulkResultsToCsv() {
  const completedItems = bulkQueue.filter(item => item.status === "completed" && item.result);
  if (completedItems.length === 0) {
    showToast("다운로드할 수 있는 완료된 분석 결과가 없습니다.", "warning");
    return;
  }

  // Construct CSV Header
  let csvContent = "지원자 파일명,매칭 점수,적합 등급,한줄 적합 평,핵심 강점,부족 역량\n";

  completedItems.forEach((item) => {
    const filename = item.file.name.replace(/,/g, " "); // Prevent CSV column split
    const score = item.result.matchScore || 0;
    const grade = item.result.matchGrade || "-";
    const fitTitle = (item.result.fitTitle || "-").replace(/,/g, " ").replace(/"/g, '""');
    
    // Strengths and Weaknesses joined by semicolon
    const strengths = (item.result.strengths || []).map(s => s.replace(/,/g, " ").replace(/"/g, '""')).join("; ");
    const weaknesses = (item.result.weaknesses || []).map(w => w.replace(/,/g, " ").replace(/"/g, '""')).join("; ");

    csvContent += `"${filename}",${score},"${grade}","${fitTitle}","${strengths}","${weaknesses}"\n`;
  });

  // Extract job name from JD first line or set default
  const jobText = document.getElementById("jobText").value.trim();
  let jobName = "이력서";
  if (jobText) {
    const firstLine = jobText.split("\n")[0];
    if (firstLine.includes("직무명")) {
      jobName = firstLine.replace("[직무명:", "").replace("]", "").trim();
    }
  }

  const dateSnippet = new Date().toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit"
  }).replace(/\. /g, "-").replace(/\./g, "").trim();

  const filename = `${jobName}_대량_분석_결과_${dateSnippet}.csv`;

  // Create UTF-8 Blob with BOM (\uFEFF) so Excel opens Korean characters correctly
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE 10+
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  showToast("엑셀(CSV) 파일이 정상적으로 다운로드되었습니다.", "success");
}

// Extract PDF text locally
async function handleUploadedFile(file) {
  // On some Windows environments, the file.type MIME type might be empty for PDF files.
  // So we check both the MIME type and the filename extension as a fallback.
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    showToast("PDF 형식의 파일만 업로드할 수 있습니다.", "error");
    return;
  }

  currentFileName = file.name;
  showToast("PDF 파일을 읽고 텍스트를 추출하는 중...", "info");

  try {
    const fileReader = new FileReader();
    fileReader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        
        // Load the PDF
        console.log("PDF Loading started...");
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        console.log("PDF Loaded successfully. Total pages:", pdf.numPages);
        let text = "";
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          console.log(`Reading page ${pageNum}...`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          console.log(`Page ${pageNum} text items count:`, textContent.items.length);
          
          if (textContent.items.length > 0) {
            console.log(`Page ${pageNum} sample text:`, textContent.items.slice(0, 3).map(item => item.str));
          }
          
          const pageText = textContent.items.map(item => item.str).join(" ");
          text += pageText + "\n";
        }

        if (text.trim().length === 0) {
          console.warn("Extracted text is empty. The PDF may be a scanned image or outline graphics.");
          showToast("PDF에서 텍스트를 추출하지 못했습니다. 이미지 스캔 파일인 경우 직접 텍스트를 붙여넣으세요.", "warning");
          return;
        }

        uploadedText = text;
        document.getElementById("resumeText").value = text;
        
        // Update UI file badge
        document.getElementById("pdfDropzone").style.display = "none";
        const fileBadge = document.getElementById("fileBadge");
        fileBadge.classList.add("active");
        document.getElementById("fileNameDisplay").innerText = file.name;
        
        showToast("PDF 텍스트 추출 완료!", "success");
      } catch (error) {
        console.error("PDF Parsing Error inside onload:", error);
        showToast("PDF 처리 중 오류가 발생했습니다. 직접 텍스트를 복사해서 붙여넣어 주세요.", "error");
      }
    };
    
    fileReader.readAsArrayBuffer(file);

  } catch (error) {
    console.error("FileReader Error:", error);
    showToast("파일을 읽는 중 오류가 발생했습니다.", "error");
  }
}

// Clear uploaded PDF file state
function clearUploadedFile() {
  uploadedText = "";
  currentFileName = "";
  document.getElementById("pdfFileInput").value = "";
  document.getElementById("resumeText").value = "";
  
  document.getElementById("pdfDropzone").style.display = "flex";
  document.getElementById("fileBadge").classList.remove("active");
  showToast("업로드된 파일이 해제되었습니다.", "info");
}

// Apply job description templates
function applyTemplate(type) {
  const jobText = document.getElementById("jobText");
  if (jobTemplates[type]) {
    jobText.value = jobTemplates[type];
    
    // Toggle active template button style
    document.querySelectorAll(".template-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    // Add active style to the target
    event.currentTarget.classList.add("active");
    
    showToast(`${type.toUpperCase()} 채용 공고 템플릿 적용 완료!`, "success");
  }
}

// API Key UI Visibility and Storage
function toggleApiKeyVisibility() {
  const input = document.getElementById("apiKeyInput");
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

document.getElementById("apiKeyInput").addEventListener("input", (e) => {
  const value = e.target.value.trim();
  if (value) {
    localStorage.setItem("gemini_api_key", value);
    updateApiKeyStatus(true);
  } else {
    localStorage.removeItem("gemini_api_key");
    updateApiKeyStatus(false);
  }
});

function updateApiKeyStatus(hasKey) {
  const statusEl = document.getElementById("apiKeyStatus");
  if (hasKey) {
    statusEl.innerText = "✓";
    statusEl.className = "api-key-status saved";
    statusEl.title = "API 키 저장됨";
  } else {
    statusEl.innerText = "●";
    statusEl.className = "api-key-status missing";
    statusEl.title = "API 키 없음 (데모 모드 가능)";
  }
}

function showApiKeyHelp() {
  alert(`[API Key 획득 방법]
1. Google AI Studio (https://aistudio.google.com/) 웹사이트에 방문합니다.
2. Google 계정으로 로그인합니다.
3. 좌측 상단 'Get API Key' 버튼을 클릭합니다.
4. 'Create API Key'를 선택하여 새 키를 생성한 후 복사합니다.
5. 본 프로그램 우측 상단 입력란에 붙여넣어 안전하게 브라우저 로컬 저장소에 저장하여 사용하세요.`);
}

// Toast Helper
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");

  toastText.innerText = message;
  
  // Set icons & styles
  if (type === "success") {
    toastIcon.innerText = "✓";
    toastIcon.className = "toast-icon success";
  } else if (type === "error") {
    toastIcon.innerText = "✕";
    toastIcon.className = "toast-icon error";
  } else if (type === "warning") {
    toastIcon.innerText = "⚠";
    toastIcon.className = "toast-icon warning";
  } else {
    toastIcon.innerText = "ℹ";
    toastIcon.className = "toast-icon info";
  }

  toast.classList.add("active");
  
  setTimeout(() => {
    toast.classList.remove("active");
  }, 4000);
}

// Start actual Gemini API Resume Analysis
async function runResumeAnalysis() {
  const apiKey = localStorage.getItem("gemini_api_key");
  const resume = document.getElementById("resumeText").value.trim();
  const job = document.getElementById("jobText").value.trim();
  const selectedModel = document.getElementById("modelSelect")?.value || "gemini-2.5-flash";

  if (!apiKey) {
    showToast("API 키가 설정되지 않았습니다. 우측 상단에 입력하거나, '데모 분석'을 즐겨보세요.", "warning");
    return;
  }
  if (!resume) {
    showToast("분석할 이력서 텍스트를 입력하거나 PDF 파일을 올려주세요.", "warning");
    return;
  }
  if (!job) {
    showToast("비교할 채용 공고(직무 기술서)를 입력해주세요.", "warning");
    return;
  }

  // Toggle Loader
  showLoader(true);

  // Construct prompt containing JSON schema instructions
  const prompt = `You are a professional recruiting manager and professional career coach.
Analyze the following candidate's Resume against the provided Job Description (JD). 
Perform a comprehensive compatibility matching audit.

Output your results strictly in the specified JSON format. Your output must contain nothing other than the raw JSON itself, ensuring it is a valid JSON. Do not include markdown codeblocks or quotes.
Translate all analysis text (fitTitle, fitDescription, competencies, strengths, weaknesses, improvements, interviewQuestions) into clean, encouraging, and highly professional Korean.

JSON Schema:
{
  "matchScore": <number between 0 and 100>,
  "matchGrade": <string, one of: "HIGH", "MID", "LOW">,
  "fitTitle": <string, short summary phrase like "프론트엔드 직무 우수 부합">,
  "fitDescription": <string, overall assessment paragraph (2-3 sentences)>,
  "competencies": [
    {"name": <string, e.g. "React 실무 기술">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "성능 최적화">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "협업/프로젝트 관리">, "score": <number between 0 and 100>},
    {"name": <string, e.g. "백엔드 아키텍처">, "score": <number between 0 and 100>}
  ],
  "strengths": [
    <string, strength 1>,
    <string, strength 2>,
    <string, strength 3>
  ],
  "weaknesses": [
    <string, gap/weakness 1>,
    <string, gap/weakness 2>
  ],
  "improvements": [
    {
      "title": <string, item title to improve>,
      "original": <string, a snippet or theme from the resume showing weak impact or poor expression>,
      "suggested": <string, a concrete rewritten example with action verbs and quantifiable results>
    },
    {
      "title": <string, item title to improve>,
      "original": <string, another weak resume snippet>,
      "suggested": <string, recommended rewrite example>
    }
  ],
  "interviewQuestions": [
    {
      "question": <string, highly specific behavioral interview question generated from the resume and JD gaps>,
      "tip": <string, actionable advice on how the candidate should answer this question based on their credentials>
    },
    {
      "question": <string, second interview question>,
      "tip": <string, advice for second question>
    },
    {
      "question": <string, third interview question>,
      "tip": <string, advice for third question>
    }
  ]
}

---
Candidate Resume:
${resume}

---
Job Description:
${job}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      const errMsg = errData.error?.message || "API call failed";
      
      // Proactively fetch supported models to help user debug
      let supportedModelsMsg = "";
      try {
        console.log("Fetching available models list for debugging...");
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        if (listResp.ok) {
          const listData = await listResp.json();
          console.log("Your API Key supports these models:", listData.models);
          if (listData.models && listData.models.length > 0) {
            const modelNames = listData.models.map(m => m.name.replace("models/", ""));
            supportedModelsMsg = `\n\n[사용 가능한 모델 목록]: ${modelNames.join(", ")}`;
          }
        }
      } catch (listErr) {
        console.warn("Failed to fetch models list for debugging:", listErr);
      }
      
      throw new Error(errMsg + supportedModelsMsg);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("분석 결과를 받지 못했습니다. 다시 시도해 주세요.");
    }

    // Clean JSON response (remove any markdown ```json backticks if Gemini ignored instructions)
    let cleanedText = resultText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    const analysisResult = JSON.parse(cleanedText);

    // Save to history
    saveAnalysisToHistory(analysisResult, job);

    // Render results
    renderResults(analysisResult);
    showToast("AI 이력서 분석이 정상 완료되었습니다!", "success");

  } catch (error) {
    console.error("Gemini API Error:", error);
    showToast(`분석 중 오류 발생: ${error.message}`, "error");
  } finally {
    showLoader(false);
  }
}

// Show/Hide Loader and placeholders
function showLoader(isActive) {
  const loader = document.getElementById("loader");
  const placeholder = document.getElementById("placeholder");
  const resultsContent = document.getElementById("resultsContent");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const demoBtn = document.getElementById("demoBtn");

  if (isActive) {
    loader.classList.add("active");
    placeholder.style.display = "none";
    resultsContent.classList.remove("active");
    analyzeBtn.disabled = true;
    demoBtn.disabled = true;
  } else {
    loader.classList.remove("active");
    analyzeBtn.disabled = false;
    demoBtn.disabled = false;
  }
}

// Render Results Dashboard UI
function renderResults(result) {
  // Hide placeholder and show content
  document.getElementById("placeholder").style.display = "none";
  const resultsContent = document.getElementById("resultsContent");
  resultsContent.classList.add("active");

  // Animate Circle Gauge Score
  const scoreValueEl = document.getElementById("scoreValue");
  const scoreCircleFill = document.getElementById("scoreCircleFill");
  
  // Count up value animation
  let currentScore = 0;
  const targetScore = result.matchScore || 0;
  const duration = 1200; // ms
  const intervalTime = 15; // ms
  const step = targetScore / (duration / intervalTime);
  
  const counter = setInterval(() => {
    currentScore += step;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(counter);
    }
    scoreValueEl.innerText = Math.round(currentScore);
  }, intervalTime);

  // SVG Stroke-dashoffset animation
  // Circumference is 345
  const offset = 345 - (345 * targetScore) / 100;
  scoreCircleFill.style.strokeDashoffset = offset;

  // Set Suitability Badge
  const matchBadge = document.getElementById("matchBadge");
  matchBadge.innerText = `적합도: ${result.matchGrade || "보통"}`;
  matchBadge.className = "suitability-badge";
  
  if (result.matchGrade === "HIGH") {
    matchBadge.classList.add("match-high");
  } else if (result.matchGrade === "MID") {
    matchBadge.classList.add("match-mid");
  } else {
    matchBadge.classList.add("match-low");
  }

  // Set Fit Title
  document.getElementById("fitTitle").innerText = result.fitTitle || "분석 리포트 완료";
  document.getElementById("fitDescription").innerText = result.fitDescription || "";

  // Render Competencies
  const competencyList = document.getElementById("competencyList");
  competencyList.innerHTML = "";
  if (result.competencies && result.competencies.length > 0) {
    result.competencies.forEach((comp) => {
      const item = document.createElement("div");
      item.className = "competency-item";
      item.innerHTML = `
        <div class="competency-info">
          <span class="competency-name">${comp.name}</span>
          <span class="competency-score">${comp.score}%</span>
        </div>
        <div class="competency-bar-track">
          <div class="competency-bar-fill" style="width: 0%;"></div>
        </div>
      `;
      competencyList.appendChild(item);
      
      // Trigger bar animation shortly after DOM insertion
      setTimeout(() => {
        item.querySelector(".competency-bar-fill").style.width = `${comp.score}%`;
      }, 100);
    });
  }

  // Render Strengths
  const strengthsList = document.getElementById("strengthsList");
  strengthsList.innerHTML = "";
  if (result.strengths && result.strengths.length > 0) {
    result.strengths.forEach((str) => {
      const li = document.createElement("li");
      li.innerText = str;
      strengthsList.appendChild(li);
    });
  } else {
    strengthsList.innerHTML = `<li>기술된 내용이 없습니다.</li>`;
  }

  // Render Weaknesses
  const weaknessesList = document.getElementById("weaknessesList");
  weaknessesList.innerHTML = "";
  if (result.weaknesses && result.weaknesses.length > 0) {
    result.weaknesses.forEach((weak) => {
      const li = document.createElement("li");
      li.innerText = weak;
      weaknessesList.appendChild(li);
    });
  } else {
    weaknessesList.innerHTML = `<li>부족한 역량이 식별되지 않았습니다.</li>`;
  }

  // Render Improvements
  const improvementsList = document.getElementById("improvementsList");
  improvementsList.innerHTML = "";
  if (result.improvements && result.improvements.length > 0) {
    result.improvements.forEach((imp) => {
      const div = document.createElement("div");
      div.className = "improvement-item";
      div.innerHTML = `
        <strong style="color: var(--text-main); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">🔧 ${imp.title}</strong>
        <div class="improvement-before-after">
          <div class="version-box original" title="기존 작성">이전: "${imp.original}"</div>
          <div class="version-box suggested" title="AI 제안 작성">수정안: "${imp.suggested}"</div>
        </div>
      `;
      improvementsList.appendChild(div);
    });
  } else {
    improvementsList.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dark);">이력서 수정 제안이 없습니다.</div>`;
  }

  // Render Interview Questions (Accordion)
  const interviewQuestions = document.getElementById("interviewQuestions");
  interviewQuestions.innerHTML = "";
  if (result.interviewQuestions && result.interviewQuestions.length > 0) {
    result.interviewQuestions.forEach((q, index) => {
      const item = document.createElement("div");
      item.className = "accordion-item";
      item.innerHTML = `
        <div class="accordion-header" onclick="toggleAccordion(this)">
          <span class="accordion-question">Q${index + 1}. ${q.question}</span>
          <span class="accordion-icon">▼</span>
        </div>
        <div class="accordion-content">
          <div class="accordion-content-inner">
            <span class="accordion-meta-title">💡 면접 답변 가이드</span>
            <p class="accordion-tip-text">${q.tip}</p>
          </div>
        </div>
      `;
      interviewQuestions.appendChild(item);
    });
  } else {
    interviewQuestions.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dark);">예상 면접 질문이 없습니다.</div>`;
  }

  // Scroll to results on smaller screens
  if (window.innerWidth < 968) {
    resultsContent.scrollIntoView({ behavior: 'smooth' });
  }
}

// Accordion Toggle Logic
function toggleAccordion(header) {
  const item = header.parentElement;
  const content = header.nextElementSibling;
  const isActive = item.classList.contains("active");

  // Close other accordions
  document.querySelectorAll(".accordion-item").forEach((node) => {
    node.classList.remove("active");
    node.querySelector(".accordion-content").style.maxHeight = null;
  });

  if (!isActive) {
    item.classList.add("active");
    content.style.maxHeight = content.scrollHeight + "px";
  }
}

// Demo Simulation Analysis Mode (Fully Client Side, no API key needed)
function runDemoAnalysis() {
  showLoader(true);
  showToast("API Key 없이 데모 분석을 진행합니다 (모의 시나리오)...", "info");

  // Determine role based on active template, or default to Frontend
  let role = "프론트엔드 개발자";
  const jobValue = document.getElementById("jobText").value;
  if (jobValue.includes("백엔드")) {
    role = "백엔드 개발자";
  } else if (jobValue.includes("마케터")) {
    role = "퍼포먼스 마케터";
  } else if (jobValue.includes("기획자")) {
    role = "프로덕트 매니저(PM)";
  }

  // Mock Analysis Database
  const demoData = {
    "프론트엔드 개발자": {
      "matchScore": 88,
      "matchGrade": "HIGH",
      "fitTitle": "프론트엔드 직무 우수 매칭",
      "fitDescription": "핵심 기술인 React와 TypeScript 지식이 매우 뛰어나며 컴포넌트 설계 역량도 양호합니다. 다만 대규모 서비스 웹 성능 최적화(Lighthouse 지표 개선 등) 및 리팩토링 사례를 수치화하여 보강하면 완벽할 것입니다.",
      "competencies": [
        {"name": "React & JS 실무력", "score": 92},
        {"name": "TypeScript 정밀성", "score": 85},
        {"name": "웹성능 및 SEO 최적화", "score": 68},
        {"name": "애자일 스프린트 협업", "score": 90}
      ],
      "strengths": [
        "React 기반 다수의 상용 웹 서비스 기획부터 배포까지 리딩한 경험 보유",
        "TypeScript를 적용하여 런타임 오류율 40% 이상 감소시킨 아키텍처 역량",
        "Figma 설계 요구사항을 모듈형 컴포넌트로 완벽하게 구현하는 뛰어난 UI 마크업 기술"
      ],
      "weaknesses": [
        "Lighthouse, Core Web Vitals 측정 기준 성능 개선을 주도했으나 구체적인 수치가 기재되지 않음",
        "React Hooks 렌더링 최적화(useMemo, useCallback 등) 기법 적용의 뚜렷한 증빙 부재"
      ],
      "improvements": [
        {
          "title": "성능 개선 프로젝트 수치화",
          "original": "사내 제품 메인 페이지 로딩 속도를 많이 최적화했습니다.",
          "suggested": "메인 번들 크기 경량화 및 코드 분할(Code Splitting)을 통해 웹 로딩 속도를 LCP 기준 3.2초에서 1.8초로 43% 단축시켰습니다."
        },
        {
          "title": "협업 규모 및 성과 구체화",
          "original": "동료 개발자들과 사이드 리팩토링을 진행했습니다.",
          "suggested": "3명의 프론트엔드 개발자 간의 정기 코드 리뷰 시스템을 도입하고 컴포넌트 재사용성을 75%까지 끌어올려 개발 생산성을 2배 향상시켰습니다."
        }
      ],
      "interviewQuestions": [
        {
          "question": "React 컴포넌트 성능 튜닝 시, 렌더링 성능을 개선하기 위해 활용한 최적화 전략과 성과를 구체적으로 말씀해 주세요.",
          "tip": "useMemo, React.memo의 오남용으로 인한 역효과 예방 지식을 언급하며, 프로파일러 툴을 통해 병목을 감지했던 흐름으로 대답하세요."
        },
        {
          "question": "TypeScript 도입 과정에서 기존 자바스크립트 레거시 코드를 리팩토링할 때 가장 어려웠던 타입 정의 이슈와 극복 사례를 설명해 주세요.",
          "tip": "타입 단언(as)을 피하고 Generic을 활용해 코드 안정성을 높인 경험을 중점으로 설명하세요."
        },
        {
          "question": "팀 프로젝트 수행 중 개발 일정 지연이 발생할 때, 타 부서(디자이너/PM)와 우선순위를 조율한 실제 경험이 있으신가요?",
          "tip": "갈등 극복 과정에서 사용한 MVP 중심의 릴리즈 전략 및 적극적인 커뮤니케이션 능력을 입증해야 합니다."
        }
      ]
    },
    "백엔드 개발자": {
      "matchScore": 84,
      "matchGrade": "HIGH",
      "fitTitle": "백엔드 개발 직무 상위 적합",
      "fitDescription": "Java/Spring 아키텍처 및 RESTful API 설계 역량이 탄탄하며 RDBMS 최적화 지식도 좋습니다. AWS 환경 인프라 구축 경험도 유의미하나 Redis 캐싱이나 배포 자동화(CI/CD) 성과 수치를 강조하면 채용 성사율이 높아집니다.",
      "competencies": [
        {"name": "API 아키텍처 설계", "score": 90},
        {"name": "DBMS 쿼리 튜닝", "score": 83},
        {"name": "AWS 클라우드 인프라", "score": 80},
        {"name": "서버 성능 튜닝", "score": 70}
      ],
      "strengths": [
        "Spring Boot 환경의 대용량 실시간 결제 API 모듈을 설계하여 무장애 서비스 운영",
        "정규화 및 Index 튜닝을 통해 대규모 DB 트래픽 환경 속 Slow Query 속도를 50% 개선",
        "클라우드 가상 시스템 환경(AWS EC2, RDS, S3) 구축 및 운영 숙련"
      ],
      "weaknesses": [
        "CI/CD 빌드 배포 배관 설계 및 Docker 컨테이너 오케스트레이션 구체적 실무력 미비",
        "Redis 캐싱이나 MSA 관련 개념의 적용 유무가 모호하게 서술됨"
      ],
      "improvements": [
        {
          "title": "데이터베이스 최적화 수치화",
          "original": "조회 쿼리 튜닝 작업을 통해 속도를 향상했습니다.",
          "suggested": "적절한 인덱스 재구성 및 커버링 인덱스 도입으로 평균 쿼리 응답 시간을 1,200ms에서 120ms로 90% 대폭 줄였습니다."
        },
        {
          "title": "AWS 아키텍처 활용 부각",
          "original": "AWS 환경에 서버를 구축하고 모니터링했습니다.",
          "suggested": "AWS EC2 인스턴스를 Auto Scaling 그룹으로 편제하고 Route53 로드밸런싱을 도입하여 동시 접속자 급증 시에도 서비스의 가용성 99.9%를 유지했습니다."
        }
      ],
      "interviewQuestions": [
        {
          "question": "데이터베이스 트래픽이 폭증할 때, 데이터 조회의 성능을 확보하기 위해 인덱스(Index) 설계 시 고려해야 할 중요한 기준은 무엇인가요?",
          "tip": "카디널리티(Cardinality)가 높은 열을 우선순위로 두고 복합 인덱스 사용 시 컬럼의 순서 규칙을 명확하게 답하는 것이 핵심입니다."
        },
        {
          "question": "분산 환경에서 발생할 수 있는 데이터 정합성 이슈를 Spring Boot 단에서 트랜잭션 전파 수준 설정을 포함해 극복한 사례가 있나요?",
          "tip": "@Transactional 옵션 활용법과 동시성 제어(낙관적/비관적 락) 기법을 연계하여 현업 실력을 보여주세요."
        }
      ]
    },
    "퍼포먼스 마케터": {
      "matchScore": 76,
      "matchGrade": "MID",
      "fitTitle": "마케팅 역량 부합 (보완 필요)",
      "fitDescription": "디지털 채널 광고 집행 능력과 콘텐츠 기획 경험은 있으나, 퍼포먼스 마케팅의 핵심인 데이터 시각화(GA4, Tableau)와 전환 단가(CAC) 최적화에 대한 구체적인 데이터 표현이 부족합니다.",
      "competencies": [
        {"name": "매체 광고 집행력", "score": 85},
        {"name": "데이터 분석 및 시각화", "score": 62},
        {"name": "A/B 테스트 및 지표 기획", "score": 70},
        {"name": "카피라이팅/콘텐츠 기획", "score": 80}
      ],
      "strengths": [
        "Meta 및 Google Ads 등 다양한 유료 매체를 활용한 월 2,000만원 규모의 광고 기획/집행",
        "소비자 트렌드를 겨냥한 영상 콘텐츠 카피라이팅 기획 능력이 탁월"
      ],
      "weaknesses": [
        "ROAS(광고비 대비 매출액) 지표 개선과 LTV(고객생애가치) 향상을 위한 심도 있는 가설 테스트 구체성 결여",
        "GA4 등을 통한 오가닉 트래픽 유입 분석 역량 명시가 부족함"
      ],
      "improvements": [
        {
          "title": "광고 효율 개선 지표 명시",
          "original": "SNS 광고를 통해 쇼핑몰 유입 고객을 늘렸습니다.",
          "suggested": "Instagram 매체 A/B 테스트 기반 소재 교체 작업을 리딩하여, 고객 획득 비용(CAC)을 30% 감축하고 신규 회원 가입 유전 환율을 기존 대비 4.2%p 증가시켰습니다."
        }
      ],
      "interviewQuestions": [
        {
          "question": "A/B 테스트를 설계할 때 가장 우선으로 두는 가설 설정 규칙과, 테스트 결과 도출 후 신뢰도를 판별했던 본인만의 마케팅 지표 공식은 무엇인가요?",
          "tip": "귀무가설과 대립가설의 구분, 통계적 유의 수준(p-value) 확인 등의 개념을 가볍게 섞어 과학적으로 접근하고 있음을 보여주세요."
        }
      ]
    },
    "프로덕트 매니저(PM)": {
      "matchScore": 81,
      "matchGrade": "MID",
      "fitTitle": "PM/기획 직무 적격자",
      "fitDescription": "고객 관점의 사용자 스토리(User Story) 작성 및 와이어프레임 설계 능력은 준수하며 개발자와의 소통 역량도 우수합니다. 애자일 스크럼 문화를 주도하여 병목 현상을 해소하고 제품 출시 일정을 달성했던 구체적인 수치 지표를 강화할 것을 권장합니다.",
      "competencies": [
        {"name": "서비스 기획 및 로드맵", "score": 88},
        {"name": "UI/UX 설계 및 Figma", "score": 82},
        {"name": "애자일/스크럼 운영력", "score": 75},
        {"name": "정량 지표 측정 능력", "score": 70}
      ],
      "strengths": [
        "피그마 기반의 고도화된 UI 와이어프레임 작성 및 개발 전달 가이드라인 수립 우수",
        "사용자 불만 데이터를 심층 분석하여 신규 회원 유입 동선의 이탈 지점을 개선한 경험"
      ],
      "weaknesses": [
        "애자일 프로세스에서 주요 릴리즈 배포 주기 단축이나 병목 해소 기여 실적 수치 미흡",
        "API 구조 정의나 시스템 흐름에 대한 기술적 이해도 언급 부재"
      ],
      "improvements": [
        {
          "title": "프로덕트 지표 개선 수치화",
          "original": "서비스의 결제 이탈률을 낮추기 위해 기획을 변경했습니다.",
          "suggested": "사용자 행동 추적(Amplitude) 데이터 기반 퍼널 분석을 통해 3단계 결제 플로우를 간소화하여 결제 과정 이탈률을 18%에서 6.5%로 대폭 개선했습니다."
        }
      ],
      "interviewQuestions": [
        {
          "question": "한정된 자원 속에서 개발팀과 디자이너의 일정이 대립하는 상황이 발생할 때, 기획자로서 최종 요구사항 스펙과 우선순위를 어떤 기준으로 합의합니까?",
          "tip": "MoSCoW 우선순위 기법을 언급하고 사용자 가치 및 비즈니스 임팩트를 측정할 수 있는 데이터 수치를 제안하여 협조를 이끌어 낸다고 답하세요."
        }
      ]
    }
  };

  // Select dataset, default to Frontend if template mismatch
  const result = demoData[role] || demoData["프론트엔드 개발자"];

  setTimeout(() => {
    showLoader(false);
    renderResults(result);
    // Save to history as demo
    saveAnalysisToHistory(result, `[DEMO] ${role} 공고`);
    showToast("데모 데이터 분석 리포트가 성공적으로 로드되었습니다!", "success");
  }, 1500);
}

// Save analysis to local history (Keep up to 5 items)
function saveAnalysisToHistory(result, jobTitleSnippet) {
  // Extract a clean job title
  let jobName = "미지정 직무";
  const firstLine = jobTitleSnippet.split("\n")[0];
  if (firstLine.includes("직무명")) {
    jobName = firstLine.replace("[직무명:", "").replace("]", "").trim();
  } else if (jobTitleSnippet.startsWith("[DEMO]")) {
    jobName = jobTitleSnippet;
  } else if (jobTitleSnippet.length > 25) {
    jobName = jobTitleSnippet.substring(0, 22) + "...";
  } else {
    jobName = jobTitleSnippet;
  }

  const historyItem = {
    id: Date.now(),
    date: new Date().toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    jobName: jobName,
    score: result.matchScore,
    payload: result
  };

  analysisHistory.unshift(historyItem);
  if (analysisHistory.length > 5) {
    analysisHistory.pop();
  }

  localStorage.setItem("analysis_history", JSON.stringify(analysisHistory));
  loadHistory();
}

// Load and render history in Sidebar
function loadHistory() {
  const historyRaw = localStorage.getItem("analysis_history");
  const historySection = document.getElementById("historySection");
  const historyList = document.getElementById("historyList");

  if (historyRaw) {
    analysisHistory = JSON.parse(historyRaw);
  } else {
    analysisHistory = [];
  }

  if (analysisHistory.length === 0) {
    historySection.style.display = "none";
    return;
  }

  historySection.style.display = "block";
  historyList.innerHTML = "";

  analysisHistory.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.onclick = () => loadHistoryItem(item.id);
    div.innerHTML = `
      <div class="history-item-info">
        <span class="history-item-job">${item.jobName}</span>
        <span class="history-item-date">${item.date}</span>
      </div>
      <div class="history-item-score">${item.score}점</div>
    `;
    historyList.appendChild(div);
  });
}

// Load a specific history item when clicked
function loadHistoryItem(id) {
  const selected = analysisHistory.find(item => item.id === id);
  if (selected) {
    renderResults(selected.payload);
    showToast(`과거 분석 데이터(${selected.jobName})를 불러왔습니다.`, "success");
  }
}
