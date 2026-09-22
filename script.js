tailwind.config = {
			    darkMode: 'class',
			    future: {
			        hoverOnlyWhenSupported: true
			    },
			    theme: {
			        extend: {
			            colors: {
			                mc: {
			                    dark: '#0d0e11',
			                    card: '#16181d',
			                    sidebar: '#121317',
			                    editor: '#1a1c23',
			                    border: '#262933',
			                    emerald: '#10b981',
			                    bp: '#3b82f6',
			                    rp: '#ec4899',
			                    gold: '#f59e0b',
			                    danger: '#ef4444'
			                }
			            },
			            fontFamily: {
			                sans: ['Plus Jakarta Sans', 'sans-serif'],
			                mono: ['JetBrains Mono', 'monospace'],
			            }
			        }
			    }
			}

// ------------------------ //

const SCRIPT_MODULES_DATA = {
			    "@minecraft/server": [
			        "2.10.0", "2.9.0", "2.8.0", "2.7.0", "2.6.0", "2.5.0", "2.4.0", "2.3.0", "2.2.0", "2.1.0", "2.0.0",
			        "1.14.0", "1.13.0", "1.12.0", "1.11.0", "1.10.0", "1.9.0", "1.8.0", "1.7.0", "1.6.0", "1.5.0",
			        "1.4.0", "1.3.0", "1.2.0", "1.1.0", "1.0.0", "2.12.0-beta", "2.10.0-rc", "1.14.0-beta", "1.13.0-beta",
			        "1.12.0-beta", "1.11.0-beta", "1.10.0-beta"
			    ],
			    "@minecraft/server-ui": [
			        "2.2.0", "2.1.0", "2.0.0", "1.3.0", "1.2.0", "1.1.0", "1.0.0", "2.4.0-beta", "2.3.0-rc",
			        "1.3.0-beta", "1.2.0-beta", "1.1.0-beta", "1.0.0-beta"
			    ],
			    "@minecraft/server-gametest": ["1.0.0-beta"],
			    "@minecraft/server-editor": ["1.0.0-beta"],
			    "@minecraft/server-admin": ["1.0.0-beta"],
			    "@minecraft/server-net": ["1.0.0-beta"],
			    "@minecraft/server-graphics": ["1.0.0-beta"],
			    "@minecraft/diagnostics": ["1.0.0-beta"],
			    "@minecraft/debug-utilities": ["1.0.0-beta"]
			};

			const TEXT_EXTENSIONS = ['json', 'js', 'ts', 'lang', 'txt', 'mcfunction', 'properties', 'geometry'];
			const AUDIO_EXTENSIONS = ['ogg', 'wav', 'mp3'];
			const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'tga'];

			let currentTab = 'bp';
			let currentViewMode = 'manifest';
			let isPopulating = false;

			let packsData = { bp: null, rp: null };
			let activeFile = null;

			let importedArchiveName = null;

			let selectedFolderPath = "";
			let selectedFilePath = "";
			let openFoldersSet = new Set();
			let currentModalMode = "";
			let pendingImportFiles = null;
			let modalTargetDir = "";

			let renameTarget = null;
			let deleteTarget = null;

			const homeView = document.getElementById('homeView');
			const dropzone = document.getElementById('dropzone');
			const fileInput = document.getElementById('fileInput');
			const customFileInput = document.getElementById('customFileInput');
			const iconFileInput = document.getElementById('iconFileInput');
			const loadingOverlay = document.getElementById('loadingOverlay');
			const editorView = document.getElementById('editorView');
			const exportBtn = document.getElementById('exportBtn');
			const validationAlert = document.getElementById('validationAlert');

			const tabBtnBP = document.getElementById('tabBtnBP');
			const tabBtnRP = document.getElementById('tabBtnRP');
			const bpHeaderIconThumb = document.getElementById('bpHeaderIconThumb');
			const rpHeaderIconThumb = document.getElementById('rpHeaderIconThumb');

			const manifestEditorView = document.getElementById('manifestEditorView');
			const filesEditorView = document.getElementById('filesEditorView');
			const modeBtnManifest = document.getElementById('modeBtnManifest');
			const modeBtnFiles = document.getElementById('modeBtnFiles');

			const rpDependencyBox = document.getElementById('rpDependencyBox');
			const toggleRpDep = document.getElementById('toggleRpDep');

			const scriptApiSection = document.getElementById('scriptApiSection');
			const scriptEntriesContainer = document.getElementById('scriptEntriesContainer');
			const modulesContainer = document.getElementById('modulesContainer');

			const mInputName = document.getElementById('mInputName');
			const mInputUuid = document.getElementById('mInputUuid');
			const mInputVersion = document.getElementById('mInputVersion');
			const mInputMinEngine = document.getElementById('mInputMinEngine');
			const mInputAuthors = document.getElementById('mInputAuthors');
			const mInputDesc = document.getElementById('mInputDesc');
			const mInputLicense = document.getElementById('mInputLicense');
			const mInputLink = document.getElementById('mInputLink');

			const toggleAuthors = document.getElementById('toggleAuthors');
			const toggleDesc = document.getElementById('toggleDesc');
			const toggleLicense = document.getElementById('toggleLicense');
			const toggleLink = document.getElementById('toggleLink');

			const sectionAuthors = document.getElementById('sectionAuthors');
			const sectionDesc = document.getElementById('sectionDesc');
			const sectionLicense = document.getElementById('sectionLicense');
			const sectionLink = document.getElementById('sectionLink');

			const manifestPackIcon = document.getElementById('manifestPackIcon');
			const manifestPackTypeBadge = document.getElementById('manifestPackTypeBadge');

			const treeContainer = document.getElementById('treeContainer');
			const treeFileCount = document.getElementById('treeFileCount');
			const treePackTitleText = document.getElementById('treePackTitleText');
			const treePackDescText = document.getElementById('treePackDescText');
			const treePackIconBox = document.getElementById('treePackIconBox');

			const editorPlaceholder = document.getElementById('editorPlaceholder');
			const codeEditorArea = document.getElementById('codeEditorArea');
			const imageViewerArea = document.getElementById('imageViewerArea');
			const audioViewerArea = document.getElementById('audioViewerArea');
			const binaryViewerArea = document.getElementById('binaryViewerArea');

			const audioPreview = document.getElementById('audioPreview');
			const audioFileName = document.getElementById('audioFileName');

			const codeTextarea = document.getElementById('codeTextarea');
			const lineNumbers = document.getElementById('lineNumbers');
			const editorFilePath = document.getElementById('editorFilePath');
			const editorFileIcon = document.getElementById('editorFileIcon');
			const editorControls = document.getElementById('editorControls');
			const unsavedBadge = document.getElementById('unsavedBadge');

			function escapeHtml(str) {
			    if (!str) return '';
			    return String(str)
			        .replace(/&/g, '&amp;')
			        .replace(/</g, '&lt;')
			        .replace(/>/g, '&gt;')
			        .replace(/"/g, '&quot;')
			        .replace(/'/g, '&#039;');
			}

			window.onload = () => {
			    renderModuleCheckboxes();
			    lucide.createIcons();
			    setupDragAndDrop();
			    setupCodeEditorEvents();
			};

			function generateUuid() {
			    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			        return v.toString(16);
			    });
			}

			function generateNewUuid() {
			    mInputUuid.value = generateUuid();
			    onManifestFormChange();
			}

			function triggerFileInput() { fileInput.click(); }
			function triggerIconUpload() {
			    if (!packsData[currentTab]) {
			        alert("先にパックを読み込んでください。");
			        return;
			    }
			    iconFileInput.click();
			}

			function showLoading(show, title = "読み込み中...", sub = "アドオンパック構造を解析しています") {
			    document.getElementById('loadingTitle').textContent = title;
			    document.getElementById('loadingSub').textContent = sub;
			    if (show) loadingOverlay.classList.remove('hidden');
			    else loadingOverlay.classList.add('hidden');
			}

			function deselectTreeSelection(event) {
			    if (event) event.stopPropagation();
			    if (!selectedFolderPath && !selectedFilePath) return;
			    selectedFolderPath = "";
			    selectedFilePath = "";
			    renderCurrentPackTree();
			}

			function getTargetDirectory() {
			    if (selectedFolderPath) return selectedFolderPath;
			    if (selectedFilePath) {
			        const idx = selectedFilePath.lastIndexOf('/');
			        return idx === -1 ? "" : selectedFilePath.substring(0, idx);
			    }
			    return "";
			}

			function getTargetPathDisplay() {
			    const pack = packsData[currentTab];
			    const archiveName = importedArchiveName
			        || (pack && pack.manifest && pack.manifest.header && pack.manifest.header.name)
			        || "Addon";
			    const folderName = (pack && pack.folderName) || (currentTab === 'bp' ? 'BP' : 'RP');
			    const base = `${archiveName}/${folderName}`;
			    const dir = modalTargetDir;
			    return dir ? `${base}/${dir}` : base;
			}

			// --- デフォルトパック生成（新規作成・片方インポート時に共通利用） ---
			function buildDefaultRpPack() {
			    const rpUuid = generateUuid();
			    const rpManifest = {
			        format_version: 2,
			        header: {
			            name: "Pack Name",
			            description: "",
			            uuid: rpUuid,
			            version: [1, 0, 0],
			            min_engine_version: [1, 20, 0]
			        },
			        modules: [
			            { type: "resources", uuid: generateUuid(), version: [1, 0, 0] }
			        ]
			    };
			    return {
			        rootPrefix: "",
			        folderName: "RP",
			        manifest: rpManifest,
			        files: [
			            {
			                path: "manifest.json",
			                fullZipPath: "manifest.json",
			                zipObj: null,
			                modifiedContent: JSON.stringify(rpManifest, null, 2)
			            }
			        ],
			        emptyFolders: new Set(),
			        iconBlob: null,
			        iconUrl: null
			    };
			}

			function buildDefaultBpPack(rpUuidForDep) {
			    const bpUuid = generateUuid();
			    const bpManifest = {
			        format_version: 2,
			        header: {
			            name: "Pack Name",
			            description: "",
			            uuid: bpUuid,
			            version: [1, 0, 0],
			            min_engine_version: [1, 20, 0]
			        },
			        modules: [
			            { type: "data", uuid: generateUuid(), version: [1, 0, 0] }
			        ],
			        dependencies: rpUuidForDep ? [{ uuid: rpUuidForDep, version: [1, 0, 0] }] : []
			    };
			    return {
			        rootPrefix: "",
			        folderName: "BP",
			        manifest: bpManifest,
			        files: [
			            {
			                path: "manifest.json",
			                fullZipPath: "manifest.json",
			                zipObj: null,
			                modifiedContent: JSON.stringify(bpManifest, null, 2)
			            }
			        ],
			        emptyFolders: new Set(),
			        iconBlob: null,
			        iconUrl: null
			    };
			}

			function createNewAddon() {
			    showLoading(true, "新規パック作成中...");
			    setTimeout(() => {
			        const rp = buildDefaultRpPack();
			        const bp = buildDefaultBpPack(rp.manifest.header.uuid);

			        importedArchiveName = null;
			        packsData = { bp, rp };
			        resetImageEditorState();

			        currentTab = 'bp';
			        selectedFolderPath = "";
			        selectedFilePath = "";
			        openFoldersSet.clear();

			        homeView.classList.add('hidden');
			        editorView.classList.remove('hidden');
			        exportBtn.classList.remove('hidden');

			        updatePackIconsAndHeader();
			        switchPackTab('bp');
			        showLoading(false);
			    }, 300);
			}

			function requestReturnHome() {
			    if (packsData.bp || packsData.rp) {
			        document.getElementById('resetModal').classList.remove('hidden');
			    }
			}

			function closeResetModal() {
			    document.getElementById('resetModal').classList.add('hidden');
			}

			function confirmReturnHome() {
			    closeResetModal();
			    stopAudioPlayback();
			    packsData = { bp: null, rp: null };
			    activeFile = null;
			    resetImageEditorState();
			    importedArchiveName = null;
			    selectedFolderPath = "";
			    selectedFilePath = "";
			    openFoldersSet.clear();
			    fileInput.value = '';

			    editorView.classList.add('hidden');
			    homeView.classList.remove('hidden');

			    exportBtn.classList.add('hidden');
			    exportBtn.disabled = true;

			    updatePackIconsAndHeader();
			}

			function setupDragAndDrop() {
			    dropzone.addEventListener('click', () => triggerFileInput());

			    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
			        dropzone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
			    });
			    ['dragenter', 'dragover'].forEach(eventName => {
			        dropzone.addEventListener('dragover', () => dropzone.classList.add('border-emerald-500', 'bg-emerald-500/10'));
			    });
			    ['dragleave', 'drop'].forEach(eventName => {
			        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-emerald-500', 'bg-emerald-500/10'));
			    });
			    dropzone.addEventListener('drop', (e) => {
			        if (e.dataTransfer.files.length) handleImportFiles(e.dataTransfer.files);
			    });
			    fileInput.addEventListener('change', (e) => {
			        if (e.target.files.length) handleImportFiles(e.target.files);
			    });
			}

			async function handleImportFiles(files) {
			    showLoading(true, "アドオンパック構造の解析中...");
			    stopAudioPlayback();
			    packsData = { bp: null, rp: null };
			    activeFile = null;
			    resetImageEditorState();
			    importedArchiveName = null;
			    selectedFolderPath = "";
			    selectedFilePath = "";
			    openFoldersSet.clear();

			    try {
			        for (let i = 0; i < files.length; i++) {
			            await parseAddonArchive(files[i]);
			        }

			        showLoading(false);
			        fileInput.value = '';

			        if (packsData.bp && packsData.rp) {
			            openImportScopeModal();
			        } else {
			            finalizeImportAndOpen();
			        }

			    } catch (err) {
			        alert("ファイルの解析に失敗しました: " + err.message);
			        console.error(err);
			        showLoading(false);
			    }
			}

			function openImportScopeModal() {
			    const bothRadio = document.querySelector('input[name="importScope"][value="both"]');
			    if (bothRadio) bothRadio.checked = true;
			    document.getElementById('importScopeModal').classList.remove('hidden');
			}

			function closeImportScopeModal() {
			    document.getElementById('importScopeModal').classList.add('hidden');
			}

			function confirmImportScope() {
			    const el = document.querySelector('input[name="importScope"]:checked');
			    const scope = el ? el.value : 'both';
			    applyImportScope(scope);
			}

			function applyImportScope(scope) {
			    if (scope === 'bp') {
			        packsData.rp = buildDefaultRpPack();
			    } else if (scope === 'rp') {
			        const rpUuid = (packsData.rp && packsData.rp.manifest && packsData.rp.manifest.header)
			            ? packsData.rp.manifest.header.uuid
			            : null;
			        packsData.bp = buildDefaultBpPack(rpUuid);
			    }
			    closeImportScopeModal();
			    finalizeImportAndOpen();
			}

			function finalizeImportAndOpen() {
			    if (packsData.bp) currentTab = 'bp';
			    else if (packsData.rp) currentTab = 'rp';

			    updatePackIconsAndHeader();
			    switchPackTab(currentTab);

			    homeView.classList.add('hidden');
			    editorView.classList.remove('hidden');
			    exportBtn.classList.remove('hidden');
			}

			async function parseAddonArchive(file) {
			    // インポートしたアーカイブ名(拡張子なし)を保持。
			    // 複数ファイルを読み込む場合でも、最初に確定した名前を優先して失わないようにする。
			    const baseName = file.name.replace(/\.(mcaddon|mcpack|zip)$/i, '');
			    if (!importedArchiveName) {
			        importedArchiveName = baseName;
			    }

			    const zip = new JSZip();
			    const archive = await zip.loadAsync(file);

			    const subMcpacks = Object.keys(archive.files).filter(p => p.toLowerCase().endsWith('.mcpack'));

			    if (subMcpacks.length > 0) {
			        for (const subPath of subMcpacks) {
			            const subBlob = await archive.files[subPath].async("blob");
			            const subZip = new JSZip();
			            const subArchive = await subZip.loadAsync(subBlob);
			            const subName = subPath.split('/').pop().replace(/\.mcpack$/i, '');
			            await scanAndExtractPacks(subArchive, subName);
			        }
			    } else {
			        await scanAndExtractPacks(archive, baseName);
			    }
			}

			async function scanAndExtractPacks(zipArchive, fallbackFolderName) {
			    const allFileKeys = Object.keys(zipArchive.files);
			    const manifestPaths = allFileKeys.filter(p => p.toLowerCase().endsWith('manifest.json'));

			    for (const manifestPath of manifestPaths) {
			        const rootPrefix = manifestPath.substring(0, manifestPath.lastIndexOf('manifest.json'));

			        let manifestText = "";
			        let manifest = {};

			        try {
			            manifestText = await zipArchive.files[manifestPath].async("string");
			            manifest = JSON.parse(manifestText);
			            if (!manifest.header || !manifest.header.uuid) continue;
			        } catch (e) {
			            continue;
			        }

			        const isRP = checkIsResourcePack(manifest, zipArchive, rootPrefix);
			        const packType = isRP ? 'rp' : 'bp';

			        // 元のフォルダ名を保持する。サブフォルダがあればそのフォルダ名、
			        // manifestがルート直下ならアーカイブ名(またはmcpack名)をフォールバックに使う。
			        const folderName = rootPrefix
			            ? rootPrefix.replace(/\/+$/, '')
			            : (fallbackFolderName || (isRP ? 'RP' : 'BP'));

			        let iconBlob = null;
			        let iconUrl = null;
			        const iconPath = allFileKeys.find(p => p.toLowerCase() === (rootPrefix + 'pack_icon.png').toLowerCase());
			        if (iconPath) {
			            iconBlob = await zipArchive.files[iconPath].async("blob");
			            iconUrl = URL.createObjectURL(iconBlob);
			        }

			        const packFiles = [];
			        for (const filePath of allFileKeys) {
			            if (filePath.startsWith(rootPrefix) && !zipArchive.files[filePath].dir) {
			                const relativePath = filePath.substring(rootPrefix.length);
			                if (relativePath) {
			                    packFiles.push({
			                        path: relativePath,
			                        fullZipPath: filePath,
			                        zipObj: zipArchive.files[filePath],
			                        modifiedContent: null
			                    });
			                }
			            }
			        }

			        packsData[packType] = {
			            rootPrefix: rootPrefix || "/",
			            folderName: folderName,
			            manifest: manifest,
			            files: packFiles,
			            emptyFolders: new Set(),
			            iconBlob: iconBlob,
			            iconUrl: iconUrl
			        };
			    }
			}

			function checkIsResourcePack(manifest, zipArchive, rootPrefix) {
			    if (manifest.modules && Array.isArray(manifest.modules)) {
			        for (const mod of manifest.modules) {
			            if (mod.type === 'resources') return true;
			            if (['data', 'script', 'client_data'].includes(mod.type)) return false;
			        }
			    }
			    const paths = Object.keys(zipArchive.files);
			    return paths.some(p =>
			        p.startsWith(rootPrefix + 'textures/') ||
			        p.startsWith(rootPrefix + 'models/') ||
			        p.startsWith(rootPrefix + 'sounds/') ||
			        p.startsWith(rootPrefix + 'ui/') ||
			        p.startsWith(rootPrefix + 'font/') ||
			        p.startsWith(rootPrefix + 'particles/')
			    );
			}

			async function handleIconFileSelected(event) {
			    const file = event.target.files[0];
			    if (!file) return;

			    const pack = packsData[currentTab];
			    if (!pack) return;

			    const arrayBuffer = await file.arrayBuffer();
			    const uint8Array = new Uint8Array(arrayBuffer);

			    pack.iconBlob = file;
			    pack.iconUrl = URL.createObjectURL(file);

			    let iconFile = pack.files.find(f => f.path.toLowerCase() === 'pack_icon.png');
			    if (iconFile) {
			        iconFile.modifiedContent = uint8Array;
			    } else {
			        pack.files.push({
			            path: 'pack_icon.png',
			            fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + 'pack_icon.png',
			            zipObj: null,
			            modifiedContent: uint8Array
			        });
			    }

			    updatePackIconsAndHeader();
			    populateManifestForm();
			    renderCurrentPackTree();
			    iconFileInput.value = '';
			}

			function updatePackIconsAndHeader() {
			    if (packsData.bp && packsData.bp.iconUrl) {
			        bpHeaderIconThumb.innerHTML = `<img src="${packsData.bp.iconUrl}" class="w-full h-full object-cover image-render-pixelated">`;
			    } else {
			        bpHeaderIconThumb.innerHTML = `<i data-lucide="cpu" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-mc-bp"></i>`;
			    }

			    if (packsData.rp && packsData.rp.iconUrl) {
			        rpHeaderIconThumb.innerHTML = `<img src="${packsData.rp.iconUrl}" class="w-full h-full object-cover image-render-pixelated">`;
			    } else {
			        rpHeaderIconThumb.innerHTML = `<i data-lucide="palette" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400"></i>`;
			    }
			    lucide.createIcons();
			}

			function switchPackTab(tab) {
			    stopAudioPlayback();
			    currentTab = tab;
			    selectedFolderPath = "";
			    selectedFilePath = "";

			    if (tab === 'bp') {
			        tabBtnBP.className = "px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 bg-mc-bp/20 text-mc-bp border border-mc-bp/30";
			        tabBtnRP.className = "px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 text-slate-400 hover:text-white border border-transparent";
			        scriptApiSection.classList.remove('hidden');
			    } else {
			        tabBtnRP.className = "px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 bg-mc-rp/20 text-mc-rp border border-mc-rp/30";
			        tabBtnBP.className = "px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 text-slate-400 hover:text-white border border-transparent";
			        scriptApiSection.classList.add('hidden');
			    }

			    populateManifestForm();
			    renderCurrentPackTree();
			    validateAllPacks();
			}

			function switchViewMode(mode) {
			    currentViewMode = mode;
			    if (mode === 'manifest') {
			        manifestEditorView.classList.remove('hidden');
			        manifestEditorView.classList.add('flex');
			        filesEditorView.classList.add('hidden');
			        filesEditorView.classList.remove('grid');

			        modeBtnManifest.className = "px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5";
			        modeBtnFiles.className = "px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5";
			    } else {
			        manifestEditorView.classList.add('hidden');
			        manifestEditorView.classList.remove('flex');
			        filesEditorView.classList.remove('hidden');
			        filesEditorView.classList.add('grid');

			        modeBtnFiles.className = "px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5";
			        modeBtnManifest.className = "px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5";

			        // ファイル編集ビュー表示時、開いているテキストがあれば高さを再計算する
			        if (activeFile && !codeEditorArea.classList.contains('hidden')) {
			            requestAnimationFrame(autoResizeTextarea);
			        }
			    }
			}

			function renderModuleCheckboxes() {
			    modulesContainer.innerHTML = '';
			    Object.keys(SCRIPT_MODULES_DATA).forEach((modName, idx) => {
			        const safeId = 'mod_' + idx;
			        const div = document.createElement('div');
			        div.className = "border border-mc-border rounded-xl p-3 bg-mc-dark/40 flex flex-col gap-2";

			        let selectOptions = SCRIPT_MODULES_DATA[modName].map(v => `<option value="${v}">${v}</option>`).join('');

			        div.innerHTML = `
			            <div class="flex items-center justify-between">
			                <label for="${safeId}" class="font-bold text-slate-200 cursor-pointer flex items-center gap-2 truncate text-xs" title="${modName}">
			                    <input type="checkbox" id="${safeId}" data-module="${modName}" onchange="toggleModuleSelect('${safeId}')" class="w-4 h-4 accent-emerald-500 rounded cursor-pointer">
			                    <span class="truncate">${modName}</span>
			                </label>
			            </div>
			            <div id="${safeId}_select_box" class="hidden mt-1">
			                <select id="${safeId}_ver" onchange="onManifestFormChange()" class="w-full bg-mc-dark border border-mc-border focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none">
			                    ${selectOptions}
			                </select>
			            </div>
			        `;
			        modulesContainer.appendChild(div);
			    });
			}

			function toggleModuleSelect(safeId) {
			    const chk = document.getElementById(safeId);
			    const box = document.getElementById(safeId + '_select_box');
			    if (chk.checked) box.classList.remove('hidden');
			    else box.classList.add('hidden');
			    onManifestFormChange();
			}

			function addScriptEntryInput(val = '') {
			    const row = document.createElement('div');
			    row.className = "flex items-center gap-2 script-entry-row";
			    row.innerHTML = `
			        <div class="flex-1 flex items-center bg-mc-dark border border-mc-border focus-within:border-emerald-500 rounded-xl px-3 py-1.5 transition-colors">
			            <span class="text-slate-500 font-mono text-xs select-none">scripts/</span>
			            <input type="text" value="${escapeHtml(val)}" oninput="onManifestFormChange()" class="w-full bg-transparent text-white font-mono text-xs focus:outline-none script-entry-val" placeholder="main">
			            <span class="text-slate-400 font-mono text-xs select-none">.js</span>
			        </div>
			        <button type="button" onclick="removeScriptEntryInput(this)" class="p-2 bg-mc-dark hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-mc-border rounded-xl transition-all shrink-0">
			            <i data-lucide="trash-2" class="w-4 h-4"></i>
			        </button>
			    `;
			    scriptEntriesContainer.appendChild(row);
			    lucide.createIcons();
			    onManifestFormChange();
			}

			function removeScriptEntryInput(btn) {
			    const row = btn.closest('.script-entry-row');
			    if (row) {
			        row.remove();
			        onManifestFormChange();
			    }
			}

			function populateManifestForm() {
			    isPopulating = true;
			    const pack = packsData[currentTab];
			    if (!pack) {
			        manifestPackIcon.innerHTML = `<i data-lucide="package-x" class="w-8 h-8 text-slate-600"></i>`;
			        rpDependencyBox.classList.add('hidden');
			        isPopulating = false;
			        return;
			    }

			    const manifest = pack.manifest;
			    const header = manifest.header || {};
			    const metadata = manifest.metadata || {};

			    manifestPackTypeBadge.textContent = currentTab === 'bp' ? 'BEHAVIOR PACK' : 'RESOURCE PACK';
			    manifestPackTypeBadge.className = `text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${currentTab === 'bp' ? 'bg-mc-bp/20 text-mc-bp border border-mc-bp/30' : 'bg-mc-rp/20 text-mc-rp border border-mc-rp/30'}`;

			    if (pack.iconUrl) {
			        manifestPackIcon.innerHTML = `<img src="${pack.iconUrl}" class="w-full h-full object-cover image-render-pixelated">`;
			    } else {
			        manifestPackIcon.innerHTML = `<i data-lucide="${currentTab === 'bp' ? 'cpu' : 'palette'}" class="w-7 h-7 sm:w-8 sm:h-8 ${currentTab === 'bp' ? 'text-mc-bp' : 'text-mc-rp'}"></i>`;
			    }

			    mInputName.value = header.name || '';
			    mInputUuid.value = header.uuid || generateUuid();
			    mInputVersion.value = Array.isArray(header.version) ? header.version.join('.') : (header.version || '1.0.0');
			    mInputMinEngine.value = Array.isArray(header.min_engine_version) ? header.min_engine_version.join('.') : (header.min_engine_version || '1.20.0');

			    if (currentTab === 'bp' && packsData.rp && packsData.rp.manifest.header) {
			        rpDependencyBox.classList.remove('hidden');
			        const rpUuid = packsData.rp.manifest.header.uuid;
			        const hasRpDep = Array.isArray(manifest.dependencies) && manifest.dependencies.some(d => d.uuid === rpUuid);
			        toggleRpDep.checked = hasRpDep;
			    } else {
			        rpDependencyBox.classList.add('hidden');
			    }

			    if (metadata.authors && Array.isArray(metadata.authors) && metadata.authors.length > 0) {
			        toggleAuthors.checked = true;
			        sectionAuthors.classList.remove('hidden');
			        mInputAuthors.value = metadata.authors.join(', ');
			    } else {
			        toggleAuthors.checked = false;
			        sectionAuthors.classList.add('hidden');
			        mInputAuthors.value = '';
			    }

			    if (header.description) {
			        toggleDesc.checked = true;
			        sectionDesc.classList.remove('hidden');
			        mInputDesc.value = header.description;
			    } else {
			        toggleDesc.checked = false;
			        sectionDesc.classList.add('hidden');
			        mInputDesc.value = '';
			    }

			    if (metadata.license) {
			        toggleLicense.checked = true;
			        sectionLicense.classList.remove('hidden');
			        mInputLicense.value = metadata.license;
			    } else {
			        toggleLicense.checked = false;
			        sectionLicense.classList.add('hidden');
			        mInputLicense.value = '';
			    }

			    if (metadata.url) {
			        toggleLink.checked = true;
			        sectionLink.classList.remove('hidden');
			        mInputLink.value = metadata.url;
			    } else {
			        toggleLink.checked = false;
			        sectionLink.classList.add('hidden');
			        mInputLink.value = '';
			    }

			    scriptEntriesContainer.innerHTML = '';
			    Object.keys(SCRIPT_MODULES_DATA).forEach((_, idx) => {
			        const safeId = 'mod_' + idx;
			        const chk = document.getElementById(safeId);
			        if (chk) {
			            chk.checked = false;
			            document.getElementById(safeId + '_select_box').classList.add('hidden');
			        }
			    });

			    if (currentTab === 'bp') {
			        if (Array.isArray(manifest.modules)) {
			            const scriptMods = manifest.modules.filter(m => m.type === 'script');
			            scriptMods.forEach(m => {
			                let rawEntry = m.entry || '';
			                rawEntry = rawEntry.replace(/^scripts\//, '').replace(/\.js$/, '');
			                if (rawEntry) addScriptEntryInput(rawEntry);
			            });
			        }

			        if (Array.isArray(manifest.dependencies)) {
			            manifest.dependencies.forEach(dep => {
			                if (dep.module_name) {
			                    Object.keys(SCRIPT_MODULES_DATA).forEach((mName, idx) => {
			                        if (mName === dep.module_name) {
			                            const safeId = 'mod_' + idx;
			                            const chk = document.getElementById(safeId);
			                            if (chk) {
			                                chk.checked = true;
			                                document.getElementById(safeId + '_select_box').classList.remove('hidden');
			                                if (dep.version) {
			                                    const verStr = Array.isArray(dep.version) ? dep.version.join('.') : String(dep.version);
			                                    const select = document.getElementById(safeId + '_ver');
			                                    if (select) {
			                                        let exists = Array.from(select.options).some(opt => opt.value === verStr);
			                                        if (!exists) {
			                                            const opt = document.createElement('option');
			                                            opt.value = verStr;
			                                            opt.textContent = verStr;
			                                            select.insertBefore(opt, select.firstChild);
			                                        }
			                                        select.value = verStr;
			                                    }
			                                }
			                            }
			                        }
			                    });
			                }
			            });
			        }
			    }

			    isPopulating = false;
			    lucide.createIcons();
			}

			function toggleManifestSection(sectionKey) {
			    if (sectionKey === 'authors') sectionAuthors.classList.toggle('hidden', !toggleAuthors.checked);
			    if (sectionKey === 'desc') sectionDesc.classList.toggle('hidden', !toggleDesc.checked);
			    if (sectionKey === 'license') sectionLicense.classList.toggle('hidden', !toggleLicense.checked);
			    if (sectionKey === 'link') sectionLink.classList.toggle('hidden', !toggleLink.checked);
			    onManifestFormChange();
			}

			function onManifestFormChange() {
			    if (isPopulating) return;

			    const pack = packsData[currentTab];
			    if (!pack) return;

			    const manifest = pack.manifest;
			    if (!manifest.header) manifest.header = {};
			    if (!manifest.metadata) manifest.metadata = {};

			    manifest.header.name = mInputName.value.trim();
			    manifest.header.uuid = mInputUuid.value.trim();

			    if (toggleDesc.checked && mInputDesc.value.trim()) {
			        manifest.header.description = mInputDesc.value.trim();
			    } else {
			        delete manifest.header.description;
			    }

			    const parseVer = (str) => {
			        const arr = str.split('.').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
			        return arr.length >= 3 ? arr.slice(0, 3) : [1, 0, 0];
			    };

			    manifest.header.version = parseVer(mInputVersion.value);
			    manifest.header.min_engine_version = parseVer(mInputMinEngine.value);

			    if (!Array.isArray(manifest.dependencies)) {
			        manifest.dependencies = [];
			    }

			    if (currentTab === 'bp') {
			        if (!Array.isArray(manifest.modules)) manifest.modules = [];

			        manifest.modules = manifest.modules.filter(m => m.type !== 'script');

			        const entryInputs = document.querySelectorAll('.script-entry-val');
			        const validNames = [];

			        entryInputs.forEach(ipt => {
			            const name = ipt.value.trim();
			            if (name) {
			                validNames.push(name);
			                manifest.modules.push({
			                    type: "script",
			                    language: "javascript",
			                    uuid: generateUuid(),
			                    entry: `scripts/${name}.js`,
			                    version: [1, 0, 0]
			                });
			            }
			        });

			        manifest.dependencies = manifest.dependencies.filter(d => !d.module_name);

			        Object.keys(SCRIPT_MODULES_DATA).forEach((mName, idx) => {
			            const safeId = 'mod_' + idx;
			            const chk = document.getElementById(safeId);
			            if (chk && chk.checked) {
			                const verVal = document.getElementById(safeId + '_ver').value;
			                manifest.dependencies.push({
			                    module_name: mName,
			                    version: verVal
			                });
			            }
			        });

			        if (packsData.rp && packsData.rp.manifest.header) {
			            const rpUuid = packsData.rp.manifest.header.uuid;
			            const rpVer = packsData.rp.manifest.header.version || [1, 0, 0];

			            manifest.dependencies = manifest.dependencies.filter(d => d.uuid !== rpUuid);

			            if (toggleRpDep.checked) {
			                manifest.dependencies.push({
			                    uuid: rpUuid,
			                    version: rpVer
			                });
			            }
			        }

			        syncScriptFiles(pack, validNames);
			    }

			    if (toggleAuthors.checked && mInputAuthors.value.trim()) {
			        manifest.metadata.authors = mInputAuthors.value.split(',').map(s => s.trim()).filter(Boolean);
			    } else {
			        delete manifest.metadata.authors;
			    }

			    if (toggleLicense.checked && mInputLicense.value.trim()) {
			        manifest.metadata.license = mInputLicense.value.trim();
			    } else {
			        delete manifest.metadata.license;
			    }

			    if (toggleLink.checked && mInputLink.value.trim()) {
			        manifest.metadata.url = mInputLink.value.trim();
			    } else {
			        delete manifest.metadata.url;
			    }

			    let manifestFile = pack.files.find(f => f.path === 'manifest.json');
			    const newManifestStr = JSON.stringify(manifest, null, 2);
			    if (manifestFile) {
			        manifestFile.modifiedContent = newManifestStr;
			    } else {
			        pack.files.push({
			            path: 'manifest.json',
			            fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + 'manifest.json',
			            zipObj: null,
			            modifiedContent: newManifestStr
			        });
			    }

			    if (activeFile && activeFile === manifestFile && !codeEditorArea.classList.contains('hidden')) {
			        codeTextarea.value = newManifestStr;
			        updateLineNumbers();
			        unsavedBadge.classList.add('hidden');
			    }

			    updatePackHeaderPreview();
			    validateAllPacks();
			}

			function syncScriptFiles(pack, validNames) {
			    const existingScriptFiles = pack.files.filter(f => f.path.startsWith('scripts/') && f.path.endsWith('.js'));
			    existingScriptFiles.forEach(sf => {
			        const sName = sf.path.substring('scripts/'.length, sf.path.length - '.js'.length);
			        if (!validNames.includes(sName)) {
			            const idx = pack.files.indexOf(sf);
			            if (idx !== -1) pack.files.splice(idx, 1);
			        }
			    });

			    validNames.forEach(name => {
			        const targetPath = `scripts/${name}.js`;
			        const found = pack.files.find(f => f.path === targetPath);
			        if (!found) {
			            pack.files.push({
			                path: targetPath,
			                fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + targetPath,
			                zipObj: null,
			                modifiedContent: "// Add your script code here\n"
			            });
			        }
			    });
			    renderCurrentPackTree();
			}

			function updatePackHeaderPreview() {
			    const pack = packsData[currentTab];
			    if (!pack) return;
			    const name = pack.manifest.header && pack.manifest.header.name ? pack.manifest.header.name : 'Untitled Pack';
			    treePackTitleText.textContent = name;
			}

			function renderCurrentPackTree() {
			    treeContainer.innerHTML = '';
			    const pack = packsData[currentTab];
			    if (!pack) {
			        treePackTitleText.textContent = "パック未選択";
			        treePackDescText.textContent = "manifest.json";
			        treeFileCount.textContent = "0 ファイル";
			        treePackIconBox.innerHTML = `<i data-lucide="package" class="w-5 h-5 text-slate-400"></i>`;
			        lucide.createIcons();
			        return;
			    }

			    updatePackHeaderPreview();
			    treePackDescText.textContent = pack.manifest.header && pack.manifest.header.uuid ? pack.manifest.header.uuid : '';

			    if (pack.iconUrl) {
			        treePackIconBox.innerHTML = `<img src="${pack.iconUrl}" class="w-full h-full object-cover image-render-pixelated">`;
			    } else {
			        treePackIconBox.innerHTML = `<i data-lucide="${currentTab === 'bp' ? 'cpu' : 'palette'}" class="w-5 h-5 ${currentTab === 'bp' ? 'text-mc-bp' : 'text-mc-rp'}"></i>`;
			    }

			    const fileList = pack.files;
			    treeFileCount.textContent = `${fileList.length} ファイル`;

			    const treeData = buildTreeStructure(pack);
			    renderTreeNode(treeData, treeContainer, 0, "");
			    lucide.createIcons();
			}

			function buildTreeStructure(pack) {
			    const root = { name: "", type: "folder", children: {}, files: [] };

			    const ensureFolder = (folderPath) => {
			        const parts = folderPath.split('/');
			        let curr = root;
			        for (const part of parts) {
			            if (!part) continue;
			            if (!curr.children[part]) {
			                curr.children[part] = { name: part, type: "folder", children: {}, files: [] };
			            }
			            curr = curr.children[part];
			        }
			        return curr;
			    };

			    if (pack.emptyFolders) {
			        pack.emptyFolders.forEach(fp => ensureFolder(fp));
			    }

			    pack.files.forEach(file => {
			        const parts = file.path.split('/');
			        let curr = root;

			        for (let i = 0; i < parts.length - 1; i++) {
			            const part = parts[i];
			            if (!part) continue;
			            if (!curr.children[part]) {
			                curr.children[part] = { name: part, type: "folder", children: {}, files: [] };
			            }
			            curr = curr.children[part];
			        }
			        curr.files.push(file);
			    });
			    return root;
			}

			function renderTreeNode(node, container, depth, parentPath) {
			    const folderNames = Object.keys(node.children).sort();
			    folderNames.forEach(fName => {
			        const folder = node.children[fName];
			        const folderPath = parentPath ? parentPath + '/' + fName : fName;
			        const isOpen = openFoldersSet.has(folderPath);
			        const isSelected = (selectedFolderPath === folderPath);

			        const itemDiv = document.createElement('div');
			        itemDiv.className = "flex flex-col my-0.5";

			        const rowDiv = document.createElement('div');
			        rowDiv.className = `flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-colors group select-none ${isSelected ? 'bg-mc-border text-white font-bold' : 'hover:bg-mc-border/60 text-slate-300'}`;

			        rowDiv.onclick = (e) => {
			            e.stopPropagation();
			            selectedFolderPath = folderPath;
			            selectedFilePath = "";
			            if (openFoldersSet.has(folderPath)) {
			                openFoldersSet.delete(folderPath);
			            } else {
			                openFoldersSet.add(folderPath);
			            }
			            renderCurrentPackTree();
			        };

			        const leftSpan = document.createElement('div');
			        leftSpan.className = "flex items-center gap-1.5 min-w-0 flex-1";
			        leftSpan.innerHTML = `
			            <i data-lucide="${isOpen ? 'folder-open' : 'folder'}" class="w-4 h-4 text-amber-400 shrink-0"></i>
			            <span class="truncate text-xs">${escapeHtml(fName)}</span>
			        `;

			        const actionDiv = document.createElement('div');
			        actionDiv.className = "flex items-center gap-1 shrink-0";
			        actionDiv.innerHTML = `
			            <button onclick="event.stopPropagation(); promptRenameFolder('${folderPath}')" title="名前変更" class="p-1 rounded hover:bg-mc-border text-slate-400 hover:text-white">
			                <i data-lucide="edit-2" class="w-3 h-3"></i>
			            </button>
			            <button onclick="event.stopPropagation(); promptDeleteFolder('${folderPath}')" title="フォルダを削除" class="p-1 rounded hover:bg-mc-border text-slate-400 hover:text-red-400">
			                <i data-lucide="trash-2" class="w-3 h-3"></i>
			            </button>
			        `;

			        rowDiv.appendChild(leftSpan);
			        rowDiv.appendChild(actionDiv);
			        itemDiv.appendChild(rowDiv);

			        if (isOpen) {
			            const childrenContainer = document.createElement('div');
			            childrenContainer.className = "flex flex-col tree-branch";
			            renderTreeNode(folder, childrenContainer, depth + 1, folderPath);
			            itemDiv.appendChild(childrenContainer);
			        }

			        container.appendChild(itemDiv);
			    });

			    const sortedFiles = [...node.files].sort((a, b) => a.path.localeCompare(b.path));
			    sortedFiles.forEach(file => {
			        const isSelected = (selectedFilePath === file.path);
			        const fileRow = document.createElement('div');
			        fileRow.className = `flex items-center justify-between py-1 px-2 my-0.5 rounded-lg cursor-pointer transition-colors group select-none ${isSelected ? 'bg-mc-border text-white font-bold' : 'hover:bg-mc-border/60 text-slate-300'}`;

			        fileRow.onclick = (e) => {
			            e.stopPropagation();
			            selectedFilePath = file.path;
			            selectedFolderPath = "";
			            openFileInEditor(file);
			            renderCurrentPackTree();
			        };

			        const fName = file.path.split('/').pop();
			        const ext = fName.split('.').pop().toLowerCase();
			        let iconName = 'file-code';
			        let iconColor = 'text-emerald-400';
			        if (IMAGE_EXTENSIONS.includes(ext)) { iconName = 'image'; iconColor = 'text-pink-400'; }
			        else if (AUDIO_EXTENSIONS.includes(ext)) { iconName = 'music'; iconColor = 'text-indigo-400'; }
			        else if (ext === 'json') { iconName = 'file-json'; iconColor = 'text-amber-400'; }
			        else if (ext === 'js' || ext === 'ts') { iconName = 'file-text'; iconColor = 'text-blue-400'; }

			        const leftSpan = document.createElement('div');
			        leftSpan.className = "flex items-center gap-1.5 min-w-0 flex-1";
			        leftSpan.innerHTML = `
			            <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} shrink-0"></i>
			            <span class="truncate text-xs">${escapeHtml(fName)}</span>
			        `;

			        const actionDiv = document.createElement('div');
			        actionDiv.className = "flex items-center gap-1 shrink-0";
			        actionDiv.innerHTML = `
			            <button onclick="event.stopPropagation(); promptRenameFile('${file.path}')" title="名前変更" class="p-1 rounded hover:bg-mc-border text-slate-400 hover:text-white">
			                <i data-lucide="edit-2" class="w-3 h-3"></i>
			            </button>
			            <button onclick="event.stopPropagation(); promptDeleteFile('${file.path}')" title="ファイルを削除" class="p-1 rounded hover:bg-mc-border text-slate-400 hover:text-red-400">
			                <i data-lucide="trash-2" class="w-3 h-3"></i>
			            </button>
			        `;

			        fileRow.appendChild(leftSpan);
			        fileRow.appendChild(actionDiv);
			        container.appendChild(fileRow);
			    });
			}

			function setupCodeEditorEvents() {
			    codeTextarea.addEventListener('input', () => {
			        updateLineNumbers();
			        if (activeFile) {
			            unsavedBadge.classList.remove('hidden');
			        }
			    });
			    codeTextarea.addEventListener('keydown', (e) => {
			        if (e.key === 'Tab') {
			            e.preventDefault();
			            const start = codeTextarea.selectionStart;
			            const end = codeTextarea.selectionEnd;
			            codeTextarea.value = codeTextarea.value.substring(0, start) + "  " + codeTextarea.value.substring(end);
			            codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
			            updateLineNumbers();
			        }
			    });
			}

			// テキストエリアを内容に合わせて自動リサイズ（縦スクロールを出さない）
			function autoResizeTextarea() {
			    codeTextarea.style.height = 'auto';
			    codeTextarea.style.height = codeTextarea.scrollHeight + 'px';
			}

			function updateLineNumbers() {
			    const lines = codeTextarea.value.split('\n').length;
			    let html = '';
			    for (let i = 1; i <= lines; i++) {
			        html += `<div>${i}</div>`;
			    }
			    lineNumbers.innerHTML = html;
			    // 行番号を更新するたびにテキストエリアの高さも合わせる
			    autoResizeTextarea();
			}

			async function openFileInEditor(file) {
			    await commitImageEditorIfDirty(); // 画像エディタの未適用変更を先に反映
			    stopAudioPlayback();
			    activeFile = file;
			    unsavedBadge.classList.add('hidden');
			    editorFilePath.textContent = file.path;
			    editorControls.classList.remove('hidden');

			    editorPlaceholder.classList.add('hidden');
			    codeEditorArea.classList.add('hidden');
			    imageViewerArea.classList.add('hidden');
			    imageEditorArea.classList.add('hidden');
			    audioViewerArea.classList.add('hidden');
			    binaryViewerArea.classList.add('hidden');

			    const ext = file.path.split('.').pop().toLowerCase();

			    if (TEXT_EXTENSIONS.includes(ext)) {
			        codeEditorArea.classList.remove('hidden');
			        let content = "";
			        if (file.modifiedContent !== null && file.modifiedContent !== undefined) {
			            content = file.modifiedContent;
			        } else if (file.zipObj) {
			            content = await file.zipObj.async("string");
			        }
			        codeTextarea.value = content;
			        updateLineNumbers();
			        // レイアウト確定後に再度高さを合わせる
			        requestAnimationFrame(autoResizeTextarea);

			        document.getElementById('formatBtn').classList.toggle('hidden', ext !== 'json');

			    } else if (IMAGE_EXTENSIONS.includes(ext)) {
			        document.getElementById('formatBtn').classList.add('hidden');
			        // 画像エディタで開く(読み込めない場合は従来のプレビュー表示へフォールバック)
			        try {
			            if (await openImageEditor(file, ext)) return;
			        } catch (err) {
			            console.error(err);
			            if (activeFile === file) alert('この画像はエディタで開けませんでした(' + err.message + ')。プレビュー表示に切り替えます。');
			        }
			        if (activeFile !== file) return;
			        imageViewerArea.classList.remove('hidden');
			        let src = "";
			        if (file.modifiedContent) {
			            const blob = new Blob([file.modifiedContent]);
			            src = URL.createObjectURL(blob);
			        } else if (file.zipObj) {
			            const blob = await file.zipObj.async("blob");
			            src = URL.createObjectURL(blob);
			        }
			        document.getElementById('imagePreview').src = src;

			    } else if (AUDIO_EXTENSIONS.includes(ext)) {
			        audioViewerArea.classList.remove('hidden');
			        document.getElementById('formatBtn').classList.add('hidden');
			        audioFileName.textContent = file.path.split('/').pop();
			        let src = "";
			        if (file.modifiedContent) {
			            const blob = new Blob([file.modifiedContent]);
			            src = URL.createObjectURL(blob);
			        } else if (file.zipObj) {
			            const blob = await file.zipObj.async("blob");
			            src = URL.createObjectURL(blob);
			        }
			        audioPreview.src = src;

			    } else {
			        binaryViewerArea.classList.remove('hidden');
			        document.getElementById('formatBtn').classList.add('hidden');
			    }
			}

			function saveCurrentFile() {
			    if (!activeFile) return;
			    const ext = activeFile.path.split('.').pop().toLowerCase();
			    if (IMAGE_EXTENSIONS.includes(ext) && imgEd.img && imgEd.file === activeFile) {
			        applyImageEditorChanges(); // 画像は非同期でエンコードして反映
			        return;
			    }
			    if (TEXT_EXTENSIONS.includes(ext)) {
			        activeFile.modifiedContent = codeTextarea.value;
			    }
			    unsavedBadge.classList.add('hidden');

			    if (activeFile.path === 'manifest.json') {
			        try {
			            const pack = packsData[currentTab];
			            pack.manifest = JSON.parse(codeTextarea.value);
			            populateManifestForm();
			        } catch (e) {}
			    }
			}

			function formatCode() {
			    if (!activeFile) return;
			    try {
			        const parsed = JSON.parse(codeTextarea.value);
			        const formatted = JSON.stringify(parsed, null, 2);
			        codeTextarea.value = formatted;
			        updateLineNumbers();

			        // 整形結果を即座に保存する（バグ①対策）
			        const ext = activeFile.path.split('.').pop().toLowerCase();
			        if (TEXT_EXTENSIONS.includes(ext)) {
			            activeFile.modifiedContent = formatted;
			        }
			        unsavedBadge.classList.add('hidden');

			        // manifest.json ならフォーム側にも反映
			        if (activeFile.path === 'manifest.json') {
			            try {
			                packsData[currentTab].manifest = JSON.parse(formatted);
			                populateManifestForm();
			            } catch (e) {}
			        }
			    } catch (e) {
			        alert("JSONの構文にエラーがあるため整形できませんでした。");
			    }
			}

			function stopAudioPlayback() {
			    if (audioPreview) {
			        audioPreview.pause();
			        audioPreview.src = "";
			    }
			}

			function validateAllPacks() {
			    let isValid = true;
			    let msg = "";

			    ['bp', 'rp'].forEach(t => {
			        const p = packsData[t];
			        if (p && p.manifest && p.manifest.header) {
			            if (!p.manifest.header.name || !p.manifest.header.uuid) {
			                isValid = false;
			                msg = "パック名またはUUIDが入力されていません。";
			            }
			        }
			    });

			    if (!isValid) {
			        validationAlert.classList.remove('hidden');
			        document.getElementById('validationAlertText').textContent = msg;
			    } else {
			        validationAlert.classList.add('hidden');
			    }
			    exportBtn.disabled = !isValid;
			}

			/* --- Modals & File System Actions --- */
			function promptCreateNewFile() {
			    const pack = packsData[currentTab];
			    if (!pack) { alert("パックが読み込まれていません。"); return; }
			    currentModalMode = "file";
			    modalTargetDir = getTargetDirectory();
			    document.getElementById('modalTypeIcon').innerHTML = `<i data-lucide="file-plus" class="w-4 h-4"></i>`;
			    document.getElementById('modalTypeTitle').textContent = "新規ファイル作成";
			    document.getElementById('modalTargetPath').textContent = getTargetPathDisplay();
			    document.getElementById('modalItemName').value = "";
			    document.getElementById('modalItemName').placeholder = "例: item.json";
			    document.getElementById('fileNameInputBlock').classList.remove('hidden');
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function promptCreateNewFolder() {
			    const pack = packsData[currentTab];
			    if (!pack) { alert("パックが読み込まれていません。"); return; }
			    currentModalMode = "folder";
			    modalTargetDir = getTargetDirectory();
			    document.getElementById('modalTypeIcon').innerHTML = `<i data-lucide="folder-plus" class="w-4 h-4"></i>`;
			    document.getElementById('modalTypeTitle').textContent = "新規フォルダ作成";
			    document.getElementById('modalTargetPath').textContent = getTargetPathDisplay();
			    document.getElementById('modalItemName').value = "";
			    document.getElementById('modalItemName').placeholder = "フォルダ名";
			    document.getElementById('fileNameInputBlock').classList.remove('hidden');
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function triggerCustomFileInput() {
			    const pack = packsData[currentTab];
			    if (!pack) { alert("パックが読み込まれていません。"); return; }
			    customFileInput.click();
			}

			function handleImportCustomFiles(event) {
			    const files = event.target.files;
			    if (!files || files.length === 0) return;

			    for (let i = 0; i < files.length; i++) {
			        const name = files[i].name;
			        if (!name.includes('.')) {
			            alert(`ファイル "${name}" に拡張子がありません。拡張子のないファイルは追加できません。`);
			            customFileInput.value = '';
			            return;
			        }
			    }

			    pendingImportFiles = files;
			    currentModalMode = "import";
			    modalTargetDir = getTargetDirectory();
			    document.getElementById('modalTypeIcon').innerHTML = `<i data-lucide="upload" class="w-4 h-4"></i>`;
			    document.getElementById('modalTypeTitle').textContent = "外部ファイル取り込み";
			    document.getElementById('modalTargetPath').textContent = getTargetPathDisplay();
			    document.getElementById('fileNameInputBlock').classList.add('hidden');
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function closeCreateItemModal() {
			    document.getElementById('createItemModal').classList.add('hidden');
			    pendingImportFiles = null;
			    customFileInput.value = '';
			}

			function showModalError(msg) {
			    document.getElementById('modalErrorText').textContent = msg;
			    document.getElementById('modalErrorAlert').classList.remove('hidden');
			}

			async function confirmCreateItem() {
			    const pack = packsData[currentTab];
			    if (!pack) return;
			    if (!pack.emptyFolders) pack.emptyFolders = new Set();

			    const targetDir = modalTargetDir;

			    if (currentModalMode === "file") {
			        const name = document.getElementById('modalItemName').value.trim();
			        if (!name) {
			            showModalError("ファイル名を入力してください。");
			            return;
			        }
			        const dotIdx = name.lastIndexOf('.');
			        if (dotIdx === -1) {
			            showModalError("拡張子を含めたファイル名を入力してください。（例: item.json）");
			            return;
			        }
			        if (dotIdx === 0) {
			            showModalError("拡張子のみのファイル名は使用できません。ファイル名を入力してください。（例: item.json）");
			            return;
			        }
			        if (dotIdx === name.length - 1) {
			            showModalError("拡張子を入力してください。（例: item.json）");
			            return;
			        }
			        const newPath = targetDir ? `${targetDir}/${name}` : name;
			        if (pack.files.some(f => f.path === newPath)) {
			            showModalError("同名のファイルが既に存在します。");
			            return;
			        }
			        if (pack.files.some(f => f.path.startsWith(newPath + '/')) || pack.emptyFolders.has(newPath)) {
			            showModalError("同名のフォルダが既に存在するため、このファイル名は使用できません。");
			            return;
			        }

			        const newFileObj = {
			            path: newPath,
			            fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + newPath,
			            zipObj: null,
			            modifiedContent: ""
			        };
			        pack.files.push(newFileObj);

			        if (targetDir) pack.emptyFolders.delete(targetDir);

			        closeCreateItemModal();
			        selectedFilePath = newPath;
			        selectedFolderPath = "";
			        renderCurrentPackTree();
			        openFileInEditor(newFileObj);

			    } else if (currentModalMode === "folder") {
			        const name = document.getElementById('modalItemName').value.trim();
			        if (!name) {
			            showModalError("フォルダ名を入力してください。");
			            return;
			        }
			        const newFolderPath = targetDir ? `${targetDir}/${name}` : name;

			        if (pack.files.some(f => f.path.startsWith(newFolderPath + '/')) || pack.emptyFolders.has(newFolderPath)) {
			            showModalError("同名のフォルダが既に存在します。");
			            return;
			        }
			        if (pack.files.some(f => f.path === newFolderPath)) {
			            showModalError("同名のファイルが既に存在するため、このフォルダ名は使用できません。");
			            return;
			        }

			        pack.emptyFolders.add(newFolderPath);
			        openFoldersSet.add(newFolderPath);

			        closeCreateItemModal();
			        selectedFolderPath = newFolderPath;
			        selectedFilePath = "";
			        renderCurrentPackTree();

			    } else if (currentModalMode === "import") {
			        if (!pendingImportFiles || pendingImportFiles.length === 0) return;

			        for (let i = 0; i < pendingImportFiles.length; i++) {
			            const f = pendingImportFiles[i];
			            const targetPath = targetDir ? `${targetDir}/${f.name}` : f.name;
			            const arrayBuffer = await f.arrayBuffer();
			            const uint8Array = new Uint8Array(arrayBuffer);

			            const existing = pack.files.find(item => item.path === targetPath);
			            if (existing) {
			                existing.modifiedContent = uint8Array;
			            } else {
			                pack.files.push({
			                    path: targetPath,
			                    fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + targetPath,
			                    zipObj: null,
			                    modifiedContent: uint8Array
			                });
			            }
			        }

			        if (targetDir) pack.emptyFolders.delete(targetDir);

			        closeCreateItemModal();
			        renderCurrentPackTree();
			    }
			}

			/* --- Rename Item --- */
			function promptRenameFile(filePath) {
			    renameTarget = { type: 'file', path: filePath };
			    document.getElementById('renameInputName').value = filePath.split('/').pop();
			    document.getElementById('renameErrorAlert').classList.add('hidden');
			    document.getElementById('renameModal').classList.remove('hidden');
			}

			function promptRenameFolder(folderPath) {
			    renameTarget = { type: 'folder', path: folderPath };
			    document.getElementById('renameInputName').value = folderPath.split('/').pop();
			    document.getElementById('renameErrorAlert').classList.add('hidden');
			    document.getElementById('renameModal').classList.remove('hidden');
			}

			function closeRenameModal() {
			    document.getElementById('renameModal').classList.add('hidden');
			    renameTarget = null;
			}

			function confirmRenameItem() {
			    if (!renameTarget) return;
			    const pack = packsData[currentTab];
			    if (!pack) return;

			    const newName = document.getElementById('renameInputName').value.trim();
			    if (!newName) {
			        document.getElementById('renameErrorText').textContent = "名前を入力してください。";
			        document.getElementById('renameErrorAlert').classList.remove('hidden');
			        return;
			    }

			    if (renameTarget.type === 'file') {
			        const oldPath = renameTarget.path;
			        const pathParts = oldPath.split('/');
			        pathParts[pathParts.length - 1] = newName;
			        const newPath = pathParts.join('/');

			        if (oldPath !== newPath && pack.files.some(f => f.path === newPath)) {
			            document.getElementById('renameErrorText').textContent = "同名のファイルが既に存在します。";
			            document.getElementById('renameErrorAlert').classList.remove('hidden');
			            return;
			        }

			        const fileObj = pack.files.find(f => f.path === oldPath);
			        if (fileObj) {
			            fileObj.path = newPath;
			            fileObj.fullZipPath = (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + newPath;
			        }
			        if (activeFile && activeFile.path === oldPath) {
			            activeFile.path = newPath;
			            editorFilePath.textContent = newPath;
			        }
			        if (selectedFilePath === oldPath) {
			            selectedFilePath = newPath;
			        }
			    } else if (renameTarget.type === 'folder') {
			        const oldFolderPath = renameTarget.path;
			        const parts = oldFolderPath.split('/');
			        parts[parts.length - 1] = newName;
			        const newFolderPath = parts.join('/');

			        pack.files.forEach(f => {
			            if (f.path.startsWith(oldFolderPath + '/')) {
			                f.path = newFolderPath + f.path.substring(oldFolderPath.length);
			                f.fullZipPath = (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + f.path;
			            }
			        });

			        if (pack.emptyFolders) {
			            const updated = new Set();
			            pack.emptyFolders.forEach(fp => {
			                if (fp === oldFolderPath) {
			                    updated.add(newFolderPath);
			                } else if (fp.startsWith(oldFolderPath + '/')) {
			                    updated.add(newFolderPath + fp.substring(oldFolderPath.length));
			                } else {
			                    updated.add(fp);
			                }
			            });
			            pack.emptyFolders = updated;
			        }

			        if (openFoldersSet.has(oldFolderPath)) {
			            openFoldersSet.delete(oldFolderPath);
			            openFoldersSet.add(newFolderPath);
			        }
			        if (selectedFolderPath === oldFolderPath) {
			            selectedFolderPath = newFolderPath;
			        }
			    }

			    closeRenameModal();
			    renderCurrentPackTree();
			}

			/* --- Delete Item --- */
			function promptDeleteFile(filePath) {
			    deleteTarget = { type: 'file', path: filePath };
			    document.getElementById('deleteTargetDesc').textContent = filePath;
			    document.getElementById('deleteConfirmModal').classList.remove('hidden');
			}

			function promptDeleteFolder(folderPath) {
			    deleteTarget = { type: 'folder', path: folderPath };
			    document.getElementById('deleteTargetDesc').textContent = folderPath + ' (フォルダ全体)';
			    document.getElementById('deleteConfirmModal').classList.remove('hidden');
			}

			function closeDeleteConfirmModal() {
			    document.getElementById('deleteConfirmModal').classList.add('hidden');
			    deleteTarget = null;
			}

			function executeDeleteItem() {
			    if (!deleteTarget) return;
			    const pack = packsData[currentTab];
			    if (!pack) return;

			    if (deleteTarget.type === 'file') {
			        const targetPath = deleteTarget.path;
			        pack.files = pack.files.filter(f => f.path !== targetPath);
			        if (selectedFilePath === targetPath) selectedFilePath = "";
			        if (activeFile && activeFile.path === targetPath) {
			            activeFile = null;
			            editorPlaceholder.classList.remove('hidden');
			            codeEditorArea.classList.add('hidden');
			            imageViewerArea.classList.add('hidden');
			            imageEditorArea.classList.add('hidden');
			            audioViewerArea.classList.add('hidden');
			            binaryViewerArea.classList.add('hidden');
			            editorControls.classList.add('hidden');
			            editorFilePath.textContent = "ファイルを選択してください";
			        }
			    } else if (deleteTarget.type === 'folder') {
			        const targetFolder = deleteTarget.path;
			        pack.files = pack.files.filter(f => !f.path.startsWith(targetFolder + '/'));
			        if (pack.emptyFolders) {
			            const updated = new Set();
			            pack.emptyFolders.forEach(fp => {
			                if (fp !== targetFolder && !fp.startsWith(targetFolder + '/')) {
			                    updated.add(fp);
			                }
			            });
			            pack.emptyFolders = updated;
			        }
			        openFoldersSet.delete(targetFolder);
			        if (selectedFolderPath === targetFolder || selectedFolderPath.startsWith(targetFolder + '/')) {
			            selectedFolderPath = "";
			        }
			        if (selectedFilePath.startsWith(targetFolder + '/')) {
			            selectedFilePath = "";
			        }
			    }

			    closeDeleteConfirmModal();
			    renderCurrentPackTree();
			}

			/* --- Export Modal & Packing --- */
			function openExportModal() {
			    validateAllPacks();

			    const hasBP = !!packsData.bp;
			    const hasRP = !!packsData.rp;

			    const scopeContainer = document.getElementById('exportScopeContainer');
			    const scopeRadios = document.getElementById('exportScopeRadios');
			    scopeRadios.innerHTML = '';

			    const scopeOptions = [];
			    if (hasBP && hasRP) {
			        scopeOptions.push({ v: 'both', t: '両方 (BP + RP)', d: 'ビヘイビアパックとリソースパックの両方を出力します' });
			        scopeOptions.push({ v: 'rp', t: 'リソースパックのみ', d: 'リソースパック単体を出力します' });
			        scopeOptions.push({ v: 'bp', t: 'ビヘイビアパックのみ', d: 'ビヘイビアパック単体を出力します' });
			    } else if (hasBP) {
			        scopeOptions.push({ v: 'bp', t: 'ビヘイビアパックのみ', d: 'ビヘイビアパック単体を出力します' });
			    } else if (hasRP) {
			        scopeOptions.push({ v: 'rp', t: 'リソースパックのみ', d: 'リソースパック単体を出力します' });
			    }

			    scopeOptions.forEach((o, i) => {
			        scopeRadios.innerHTML += `
			            <label class="flex items-center gap-3 p-3 rounded-xl bg-mc-dark border border-mc-border hover:border-emerald-500/50 cursor-pointer transition-all">
			                <input type="radio" name="exportScope" value="${o.v}" ${i === 0 ? 'checked' : ''} onchange="renderExportFormatOptions()" class="accent-emerald-500 w-4 h-4">
			                <div>
			                    <p class="font-bold text-white text-xs">${o.t}</p>
			                    <p class="text-[11px] text-slate-400">${o.d}</p>
			                </div>
			            </label>
			        `;
			    });

			    scopeContainer.classList.toggle('hidden', scopeOptions.length <= 1);

			    renderExportFormatOptions();
			    document.getElementById('exportModal').classList.remove('hidden');
			}

			function getSelectedExportScope() {
			    const el = document.querySelector('input[name="exportScope"]:checked');
			    if (el) return el.value;
			    return packsData.bp ? 'bp' : 'rp';
			}

			function renderExportFormatOptions() {
			    const scope = getSelectedExportScope();
			    const formatRadios = document.getElementById('exportFormatRadios');
			    formatRadios.innerHTML = '';

			    let opts;
			    if (scope === 'both') {
			        opts = [
			            { v: 'mcaddon', t: '.mcaddon (統合パック)', d: 'BPとRPを一つにまとめて出力します（推奨）' },
			            { v: 'zip', t: '.zip', d: 'BPとRPをまとめたzipファイルで出力します' }
			        ];
			    } else {
			        opts = [
			            { v: 'mcpack', t: '.mcpack', d: 'パック単体を出力します（推奨）' },
			            { v: 'zip', t: '.zip', d: 'パック単体をzipファイルで出力します' }
			        ];
			    }

			    opts.forEach((o, i) => {
			        formatRadios.innerHTML += `
			            <label class="flex items-center gap-3 p-3 rounded-xl bg-mc-dark border border-mc-border hover:border-emerald-500/50 cursor-pointer transition-all">
			                <input type="radio" name="exportFormat" value="${o.v}" ${i === 0 ? 'checked' : ''} class="accent-emerald-500 w-4 h-4">
			                <div>
			                    <p class="font-bold text-white text-xs">${o.t}</p>
			                    <p class="text-[11px] text-slate-400">${o.d}</p>
			                </div>
			            </label>
			        `;
			    });
			}

			function closeExportModal() {
			    document.getElementById('exportModal').classList.add('hidden');
			}

			async function executeExport() {
			    const scope = getSelectedExportScope();
			    const fmtEl = document.querySelector('input[name="exportFormat"]:checked');
			    const format = fmtEl ? fmtEl.value : 'zip';

			    closeExportModal();
			    showLoading(true, "パックを圧縮・生成中...", "ファイルをパッケージングしています");

			    try {
			        await commitImageEditorIfDirty(); // 画像エディタの未適用変更を反映
			        const zip = new JSZip();
			        let outName = "Addon";
			        let ext = "zip";

			        if (scope === 'both') {
			            // インポート時に保持した元フォルダ名を復元して出力（バグ②対策）
			            const bpFolderName = packsData.bp.folderName || "BP";
			            const rpFolderName = packsData.rp.folderName || "RP";

			            await packFilesToZip(packsData.bp, zip.folder(bpFolderName));
			            await packFilesToZip(packsData.rp, zip.folder(rpFolderName));

			            // 出力ファイル名はインポート時のアーカイブ名を優先して復元
			            outName = importedArchiveName
			                || (packsData.bp.manifest.header && packsData.bp.manifest.header.name)
			                || "Addon";
			            ext = (format === 'mcaddon') ? 'mcaddon' : 'zip';

			        } else {
			            const pack = (scope === 'bp') ? packsData.bp : packsData.rp;
			            await packFilesToZip(pack, zip);

			            // 単体出力は元フォルダ名 → アーカイブ名 → manifest名 の順で復元
			            const folderBase = (pack.folderName || '').split('/').pop();
			            outName = folderBase
			                || importedArchiveName
			                || (pack.manifest.header && pack.manifest.header.name)
			                || (scope === 'bp' ? 'BehaviorPack' : 'ResourcePack');
			            ext = (format === 'mcpack') ? 'mcpack' : 'zip';
			        }

			        const blob = await zip.generateAsync({ type: "blob" });
			        downloadBlob(blob, `${outName}.${ext}`);

			        showLoading(false);
			    } catch (err) {
			        alert("出力エラーが発生しました: " + err.message);
			        console.error(err);
			        showLoading(false);
			    }
			}

			async function packFilesToZip(pack, zipFolder) {
			    if (pack.emptyFolders) {
			        for (const folderPath of pack.emptyFolders) {
			            zipFolder.folder(folderPath);
			        }
			    }

			    for (const fileItem of pack.files) {
			        if (fileItem.path.endsWith('/.keep')) continue;

			        if (fileItem.modifiedContent !== null && fileItem.modifiedContent !== undefined) {
			            zipFolder.file(fileItem.path, fileItem.modifiedContent);
			        } else if (fileItem.zipObj) {
			            const content = await fileItem.zipObj.async("uint8array");
			            zipFolder.file(fileItem.path, content);
			        }
			    }
			}

			function downloadBlob(blob, filename) {
			    const url = URL.createObjectURL(blob);
			    const a = document.createElement('a');
			    a.href = url;
			    a.download = filename;
			    document.body.appendChild(a);
			    a.click();
			    document.body.removeChild(a);
			    URL.revokeObjectURL(url);
			}

			/* =====================================================================
			   画像エディタ (PNG / JPG / JPEG / TGA)
			   - 作業データは ImageData(非プリマルチプライ RGBA)で保持
			   - 「適用」またはファイル切替・出力時に元の形式へエンコードして
			     file.modifiedContent(Uint8Array)へ書き戻す
			   ===================================================================== */
			const IMG_ED_ZOOMS = [0.125, 0.25, 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64];
			const IMG_ED_MAX_SIZE = 4096;
			const IMG_ED_BASE_COLORS = [
			    '#000000', '#ffffff', '#7f7f7f', '#c3c3c3', '#880015', '#ed1c24', '#ff7f27', '#fff200',
			    '#22b14c', '#b5e61d', '#00a2e8', '#3f48cc', '#a349a4', '#ffaec9', '#b97a57', '#c8bfe7'
			];
			const IMG_ED_TOOLS = {
			    hand:    { label: '手のひら',   hint: 'ドラッグで表示位置を動かします。',                 opts: [] },
			    pen:     { label: 'ペン',       hint: 'タップ/ドラッグで描画します。',                     opts: ['color', 'opacity', 'size', 'shape'] },
			    eraser:  { label: '消しゴム',   hint: 'タップ/ドラッグで透明にします。',                   opts: ['opacity', 'size', 'shape'] },
			    fill:    { label: '塗りつぶし', hint: '同じ色でつながった範囲を塗りつぶします。',         opts: ['color', 'opacity', 'tolerance'] },
			    picker:  { label: 'スポイト',   hint: 'タップした位置の色を取得します。',                 opts: ['color'] },
			    line:    { label: '直線',       hint: 'ドラッグで直線を引きます(Shiftで角度を固定)。',   opts: ['color', 'opacity', 'size', 'shape'] },
			    rect:    { label: '四角形',     hint: 'ドラッグで四角形を描きます(Shiftで正方形)。',     opts: ['color', 'opacity', 'size', 'fillmode'] },
			    ellipse: { label: '楕円',       hint: 'ドラッグで楕円を描きます(Shiftで正円)。',         opts: ['color', 'opacity', 'size', 'fillmode'] }
			};

			const imageEditorArea = document.getElementById('imageEditorArea');
			const imgEdViewport = document.getElementById('imgEdViewport');
			const imgEdStage = document.getElementById('imgEdStage');
			const imgEdCanvas = document.getElementById('imgEdCanvas');
			const imgEdGrid = document.getElementById('imgEdGrid');
			const imgEdCursor = document.getElementById('imgEdCursor');
			const imgEdCtx = imgEdCanvas.getContext('2d', { willReadFrequently: true });

			const imgEd = {
			    file: null, ext: '', img: null,
			    history: [], future: [], dirty: false, editGen: 0,
			    tool: 'pen', prevTool: 'pen',
			    color: '#10b981', opacity: 100, size: 1, shape: 'square', fillShape: false, tolerance: 0,
			    jpegQuality: 92, zoom: 8, showGrid: true, recent: [],
			    stroke: null, pan: null,
			    resizeMode: 'scale', anchor: [1, 1], lockAspect: true
			};

			/* ---------- TGA デコード / エンコード ---------- */
			function decodeTGA(bytes) {
			    if (bytes.length < 18) throw new Error('TGAヘッダーが短すぎます');
			    const idLen = bytes[0], cmType = bytes[1], imgType = bytes[2];
			    const cmStart = bytes[3] | (bytes[4] << 8);
			    const cmLen = bytes[5] | (bytes[6] << 8);
			    const cmDepth = bytes[7];
			    const width = bytes[12] | (bytes[13] << 8);
			    const height = bytes[14] | (bytes[15] << 8);
			    const bpp = bytes[16];
			    const desc = bytes[17];
			    const rle = imgType >= 9;
			    const baseType = rle ? imgType - 8 : imgType;

			    if (baseType !== 1 && baseType !== 2 && baseType !== 3) throw new Error(`未対応のTGA形式です (type ${imgType})`);
			    if (!width || !height) throw new Error('TGAのサイズが不正です');
			    if (baseType === 1 && (cmType !== 1 || (bpp !== 8 && bpp !== 16))) throw new Error('未対応のカラーマップ形式です');
			    if (baseType === 2 && ![15, 16, 24, 32].includes(bpp)) throw new Error(`未対応のビット深度です (${bpp}bit)`);
			    if (baseType === 3 && bpp !== 8 && bpp !== 16) throw new Error(`未対応のビット深度です (${bpp}bit)`);

			    const bytesPP = (bpp + 7) >> 3;
			    const alphaBits = desc & 0x0f;
			    const flipY = !(desc & 0x20);
			    const flipX = !!(desc & 0x10);
			    let pos = 18 + idLen;

			    let palette = null;
			    if (cmType === 1) {
			        const eb = (cmDepth + 7) >> 3;
			        palette = new Uint8Array(cmLen * 4);
			        for (let i = 0; i < cmLen; i++) {
			            const p = pos + i * eb;
			            let r, g, b, a = 255;
			            if (cmDepth === 24 || cmDepth === 32) {
			                b = bytes[p]; g = bytes[p + 1]; r = bytes[p + 2];
			                if (cmDepth === 32) a = bytes[p + 3];
			            } else {
			                const v = bytes[p] | (bytes[p + 1] << 8);
			                r = Math.round(((v >> 10) & 31) * 255 / 31);
			                g = Math.round(((v >> 5) & 31) * 255 / 31);
			                b = Math.round((v & 31) * 255 / 31);
			            }
			            palette[i * 4] = r; palette[i * 4 + 1] = g; palette[i * 4 + 2] = b; palette[i * 4 + 3] = a;
			        }
			        pos += cmLen * eb;
			    }

			    const total = width * height;
			    const out = new Uint8ClampedArray(total * 4);
			    let pr = 0, pg = 0, pb = 0, pa = 255;

			    const decodePx = (p) => {
			        if (baseType === 3) {
			            pr = pg = pb = bytes[p];
			            pa = bpp === 16 ? bytes[p + 1] : 255;
			        } else if (baseType === 1) {
			            const v = bytesPP === 1 ? bytes[p] : (bytes[p] | (bytes[p + 1] << 8));
			            const pi = (v - cmStart) * 4;
			            if (palette && pi >= 0 && pi < palette.length) {
			                pr = palette[pi]; pg = palette[pi + 1]; pb = palette[pi + 2]; pa = palette[pi + 3];
			            } else { pr = pg = pb = 0; pa = 0; }
			        } else if (bpp === 32) {
			            pb = bytes[p]; pg = bytes[p + 1]; pr = bytes[p + 2]; pa = bytes[p + 3];
			        } else if (bpp === 24) {
			            pb = bytes[p]; pg = bytes[p + 1]; pr = bytes[p + 2]; pa = 255;
			        } else {
			            const v = bytes[p] | (bytes[p + 1] << 8);
			            pr = Math.round(((v >> 10) & 31) * 255 / 31);
			            pg = Math.round(((v >> 5) & 31) * 255 / 31);
			            pb = Math.round((v & 31) * 255 / 31);
			            pa = (bpp === 16 && alphaBits > 0) ? ((v & 0x8000) ? 255 : 0) : 255;
			        }
			    };
			    const writePx = (idx) => {
			        let row = (idx / width) | 0;
			        let col = idx - row * width;
			        if (flipY) row = height - 1 - row;
			        if (flipX) col = width - 1 - col;
			        const o = (row * width + col) * 4;
			        out[o] = pr; out[o + 1] = pg; out[o + 2] = pb; out[o + 3] = pa;
			    };
			    const shortErr = () => new Error('TGAのデータが不足しています');

			    let idx = 0;
			    if (!rle) {
			        if (pos + total * bytesPP > bytes.length) throw shortErr();
			        while (idx < total) { decodePx(pos); pos += bytesPP; writePx(idx++); }
			    } else {
			        while (idx < total) {
			            if (pos >= bytes.length) throw shortErr();
			            const hdr = bytes[pos++];
			            const cnt = (hdr & 0x7f) + 1;
			            if (hdr & 0x80) {
			                if (pos + bytesPP > bytes.length) throw shortErr();
			                decodePx(pos); pos += bytesPP;
			                for (let k = 0; k < cnt && idx < total; k++) writePx(idx++);
			            } else {
			                for (let k = 0; k < cnt && idx < total; k++) {
			                    if (pos + bytesPP > bytes.length) throw shortErr();
			                    decodePx(pos); pos += bytesPP;
			                    writePx(idx++);
			                }
			            }
			        }
			    }

			    // 32bitでアルファ情報なし(descのalphaビット=0)かつ全て透明なら、不透明として扱う
			    if (bpp === 32 && alphaBits === 0) {
			        let allZero = true;
			        for (let i = 3; i < out.length; i += 4) { if (out[i] !== 0) { allZero = false; break; } }
			        if (allZero) for (let i = 3; i < out.length; i += 4) out[i] = 255;
			    }
			    return new ImageData(out, width, height);
			}

			// 非圧縮 32bit BGRA / 左下原点 で出力(最も互換性が高い形式)
			function encodeTGA(img) {
			    const w = img.width, h = img.height;
			    if (w > 65535 || h > 65535) throw new Error('TGAの最大サイズ(65535px)を超えています');
			    const out = new Uint8Array(18 + w * h * 4);
			    out[2] = 2;
			    out[12] = w & 255; out[13] = (w >> 8) & 255;
			    out[14] = h & 255; out[15] = (h >> 8) & 255;
			    out[16] = 32;
			    out[17] = 0x08;
			    const s = img.data;
			    let o = 18;
			    for (let y = h - 1; y >= 0; y--) {
			        for (let x = 0; x < w; x++) {
			            const i = (y * w + x) * 4;
			            out[o++] = s[i + 2]; out[o++] = s[i + 1]; out[o++] = s[i]; out[o++] = s[i + 3];
			        }
			    }
			    return out;
			}

			/* ---------- 読み込み / 書き出し ---------- */
			async function imgEdGetBytes(file) {
			    const mc = file.modifiedContent;
			    if (mc !== null && mc !== undefined) {
			        if (mc instanceof Uint8Array) return mc;
			        if (typeof mc === 'string') return new TextEncoder().encode(mc);
			        return new Uint8Array(mc);
			    }
			    if (file.zipObj) return await file.zipObj.async('uint8array');
			    throw new Error('ファイルデータが見つかりません');
			}

			async function imgEdDecodeFile(file, ext) {
			    const bytes = await imgEdGetBytes(file);
			    if (ext === 'tga') return decodeTGA(bytes);

			    const blob = new Blob([bytes], { type: ext === 'png' ? 'image/png' : 'image/jpeg' });
			    let bmp = null;
			    try {
			        bmp = await createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
			    } catch (e) {
			        const url = URL.createObjectURL(blob);
			        try {
			            const im = new Image();
			            im.src = url;
			            await im.decode();
			            bmp = im;
			        } finally { URL.revokeObjectURL(url); }
			    }
			    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight;
			    if (!w || !h) throw new Error('画像を読み込めませんでした');
			    const c = document.createElement('canvas');
			    c.width = w; c.height = h;
			    const cx = c.getContext('2d', { willReadFrequently: true });
			    cx.drawImage(bmp, 0, 0);
			    if (bmp.close) bmp.close();
			    return cx.getImageData(0, 0, w, h);
			}

			async function imgEdEncode(img, ext) {
			    if (ext === 'tga') return encodeTGA(img);
			    const w = img.width, h = img.height;
			    const c = document.createElement('canvas');
			    c.width = w; c.height = h;
			    const cx = c.getContext('2d');
			    const isJpeg = (ext === 'jpg' || ext === 'jpeg');
			    if (isJpeg) {
			        const t = document.createElement('canvas');
			        t.width = w; t.height = h;
			        t.getContext('2d').putImageData(img, 0, 0);
			        cx.fillStyle = '#ffffff';
			        cx.fillRect(0, 0, w, h);
			        cx.drawImage(t, 0, 0);
			    } else {
			        cx.putImageData(img, 0, 0);
			    }
			    const blob = await new Promise((resolve, reject) => {
			        c.toBlob(
			            (b) => b ? resolve(b) : reject(new Error('画像のエンコードに失敗しました')),
			            isJpeg ? 'image/jpeg' : 'image/png',
			            isJpeg ? imgEd.jpegQuality / 100 : undefined
			        );
			    });
			    return new Uint8Array(await blob.arrayBuffer());
			}

			async function openImageEditor(file, ext) {
			    const decoded = await imgEdDecodeFile(file, ext);
			    if (activeFile !== file) return true; // 読み込み中に別ファイルへ切り替わった
			    imgEd.file = file;
			    imgEd.ext = ext;
			    imgEd.img = decoded;
			    imgEd.history = [];
			    imgEd.future = [];
			    imgEd.dirty = false;
			    imgEd.stroke = null;
			    imgEd.pan = null;
			    imageEditorArea.classList.remove('hidden');
			    imgEdSyncCanvasSize();
			    imgEdRender();
			    imgEdFitZoom();
			    imgEdSyncUi();
			    return true;
			}

			async function applyImageEditorChanges() {
			    const file = imgEd.file;
			    if (!file || !imgEd.img) return;
			    const ext = file.path.split('.').pop().toLowerCase();
			    if (!IMAGE_EXTENSIONS.includes(ext)) { imgEd.dirty = false; return; }
			    const gen = imgEd.editGen;
			    try {
			        const bytes = await imgEdEncode(imgEd.img, ext);
			        file.modifiedContent = bytes;
			        if (imgEd.editGen === gen) {
			            imgEd.dirty = false;
			            if (activeFile === file) unsavedBadge.classList.add('hidden');
			        }

			        // pack_icon.png を編集した場合はパックアイコン表示にも反映
			        const pack = [packsData.bp, packsData.rp].find(p => p && p.files.includes(file));
			        if (pack && file.path.toLowerCase() === 'pack_icon.png') {
			            pack.iconBlob = new Blob([bytes], { type: 'image/png' });
			            pack.iconUrl = URL.createObjectURL(pack.iconBlob);
			            updatePackIconsAndHeader();
			            populateManifestForm();
			            renderCurrentPackTree();
			        }
			    } catch (err) {
			        console.error(err);
			        alert('画像の保存に失敗しました: ' + err.message);
			    }
			}

			async function commitImageEditorIfDirty() {
			    if (!imgEd.dirty || !imgEd.file || !imgEd.img) return;
			    const exists = [packsData.bp, packsData.rp].some(p => p && p.files.includes(imgEd.file));
			    if (!exists) { imgEd.dirty = false; return; }
			    await applyImageEditorChanges();
			}

			/* ---------- 描画・表示 ---------- */
			function imgEdSyncCanvasSize() {
			    const { width, height } = imgEd.img;
			    if (imgEdCanvas.width !== width) imgEdCanvas.width = width;
			    if (imgEdCanvas.height !== height) imgEdCanvas.height = height;
			    imgEdApplyZoomStyle();
			}

			function imgEdRender() {
			    imgEdCtx.putImageData(imgEd.img, 0, 0);
			}

			function imgEdApplyZoomStyle() {
			    if (!imgEd.img) return;
			    const z = imgEd.zoom, w = imgEd.img.width * z, h = imgEd.img.height * z;
			    imgEdStage.style.width = w + 'px';
			    imgEdStage.style.height = h + 'px';
			    imgEdCanvas.style.width = w + 'px';
			    imgEdCanvas.style.height = h + 'px';
			    const showGrid = imgEd.showGrid && z >= 6;
			    imgEdGrid.style.display = showGrid ? 'block' : 'none';
			    if (showGrid) {
			        imgEdGrid.style.backgroundImage =
			            'linear-gradient(to right, rgba(255,255,255,.22) 1px, transparent 1px),' +
			            'linear-gradient(to bottom, rgba(255,255,255,.22) 1px, transparent 1px)';
			        imgEdGrid.style.backgroundSize = z + 'px ' + z + 'px';
			    }
			    document.getElementById('imgEdZoomText').textContent = Math.round(z * 100) + '%';
			    document.getElementById('imgEdGridBtn').classList.toggle('active', imgEd.showGrid);
			}

			function imgEdFitZoom() {
			    if (!imgEd.img) return;
			    const vw = imgEdViewport.clientWidth - 24, vh = imgEdViewport.clientHeight - 24;
			    let z = 8;
			    if (vw > 0 && vh > 0) {
			        const fit = Math.min(vw / imgEd.img.width, vh / imgEd.img.height);
			        z = IMG_ED_ZOOMS[0];
			        for (const c of IMG_ED_ZOOMS) if (c <= fit) z = c;
			    }
			    imgEd.zoom = z;
			    imgEdApplyZoomStyle();
			}

			function imgEdSetZoom(z, clientX, clientY) {
			    if (!imgEd.img) return;
			    const vr = imgEdViewport.getBoundingClientRect();
			    if (clientX === undefined) { clientX = vr.left + vr.width / 2; clientY = vr.top + vr.height / 2; }
			    const r1 = imgEdCanvas.getBoundingClientRect();
			    const ix = (clientX - r1.left) / imgEd.zoom, iy = (clientY - r1.top) / imgEd.zoom;
			    imgEd.zoom = z;
			    imgEdApplyZoomStyle();
			    const r2 = imgEdCanvas.getBoundingClientRect();
			    imgEdViewport.scrollLeft += r2.left + ix * z - clientX;
			    imgEdViewport.scrollTop += r2.top + iy * z - clientY;
			}

			function imgEdZoomStep(dir, clientX, clientY) {
			    let i = IMG_ED_ZOOMS.indexOf(imgEd.zoom);
			    if (i < 0) {
			        i = 0;
			        for (let k = 0; k < IMG_ED_ZOOMS.length; k++) if (IMG_ED_ZOOMS[k] <= imgEd.zoom) i = k;
			    }
			    const ni = Math.max(0, Math.min(IMG_ED_ZOOMS.length - 1, i + dir));
			    imgEdSetZoom(IMG_ED_ZOOMS[ni], clientX, clientY);
			}

			function imgEdToggleGrid() {
			    imgEd.showGrid = !imgEd.showGrid;
			    imgEdApplyZoomStyle();
			}

			/* ---------- UI 同期 ---------- */
			function imgEdSyncUi() {
			    const def = IMG_ED_TOOLS[imgEd.tool];
			    imageEditorArea.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === imgEd.tool));
			    imageEditorArea.querySelectorAll('[data-opt]').forEach(el => el.classList.toggle('hidden', !def.opts.includes(el.dataset.opt)));
			    imageEditorArea.querySelectorAll('[data-shape]').forEach(b => b.classList.toggle('active', b.dataset.shape === imgEd.shape));
			    imageEditorArea.querySelectorAll('[data-fillmode]').forEach(b => b.classList.toggle('active', (b.dataset.fillmode === '1') === imgEd.fillShape));
			    document.getElementById('imgEdHint').textContent = `${def.label}: ${def.hint}`;

			    const isJpeg = (imgEd.ext === 'jpg' || imgEd.ext === 'jpeg');
			    imageEditorArea.querySelector('[data-jpeg]').classList.toggle('hidden', !isJpeg);
			    document.getElementById('imgEdJpegNote').classList.toggle('hidden', !isJpeg);

			    document.getElementById('imgEdColor').value = imgEd.color;
			    document.getElementById('imgEdOpacity').value = imgEd.opacity;
			    document.getElementById('imgEdOpacityVal').textContent = imgEd.opacity + '%';
			    document.getElementById('imgEdSize').value = imgEd.size;
			    document.getElementById('imgEdSizeVal').textContent = imgEd.size + 'px';
			    document.getElementById('imgEdTolerance').value = imgEd.tolerance;
			    document.getElementById('imgEdToleranceVal').textContent = imgEd.tolerance;
			    document.getElementById('imgEdJpegQuality').value = imgEd.jpegQuality;
			    document.getElementById('imgEdJpegQualityVal').textContent = imgEd.jpegQuality + '%';

			    imgEdCanvas.style.cursor = imgEd.tool === 'hand' ? 'grab' : 'crosshair';
			    imgEdRenderPalette();
			    imgEdUpdateUndoButtons();
			    imgEdUpdateSizeText();
			}

			function imgEdUpdateSizeText() {
			    if (!imgEd.img) return;
			    document.getElementById('imgEdSizeText').textContent = `${imgEd.img.width} × ${imgEd.img.height} px / ${imgEd.ext.toUpperCase()}`;
			}

			function imgEdUpdateUndoButtons() {
			    document.getElementById('imgEdUndoBtn').disabled = imgEd.history.length === 0;
			    document.getElementById('imgEdRedoBtn').disabled = imgEd.future.length === 0;
			}

			function imgEdRenderPalette() {
			    const box = document.getElementById('imgEdPalette');
			    let html = '';
			    IMG_ED_BASE_COLORS.forEach(c => {
			        html += `<button class="imged-swatch" style="background:${c}" title="${c}" onclick="imgEdSetColor('${c}')"></button>`;
			    });
			    if (imgEd.recent.length) {
			        html += '<span class="imged-sep"></span><span class="imged-lbl">最近</span>';
			        imgEd.recent.forEach(c => {
			            html += `<button class="imged-swatch" style="background:${c}" title="${c}" onclick="imgEdSetColor('${c}')"></button>`;
			        });
			    }
			    box.innerHTML = html;
			}

			function imgEdSetTool(t) {
			    if (!IMG_ED_TOOLS[t] || imgEd.stroke) return;
			    if (t !== 'picker' && t !== 'hand') imgEd.prevTool = t;
			    imgEd.tool = t;
			    imgEdCursor.style.display = 'none';
			    imgEdSyncUi();
			}
			function imgEdSetShape(s) { imgEd.shape = s; imgEdSyncUi(); }
			function imgEdSetFillMode(f) { imgEd.fillShape = !!f; imgEdSyncUi(); }
			function imgEdSetColor(hex) {
			    imgEd.color = hex;
			    document.getElementById('imgEdColor').value = hex;
			}
			function imgEdRememberColor() {
			    const c = imgEd.color.toLowerCase();
			    if (imgEd.recent[0] === c) return;
			    imgEd.recent = [c, ...imgEd.recent.filter(x => x !== c)].slice(0, 10);
			    imgEdRenderPalette();
			}

			/* ---------- 履歴 ---------- */
			function imgEdClone(img) {
			    return new ImageData(new Uint8ClampedArray(img.data), img.width, img.height);
			}
			function imgEdTrimHistory() {
			    const bytes = Math.max(1, imgEd.img.width * imgEd.img.height * 4);
			    const max = Math.max(5, Math.min(60, Math.floor(160 * 1024 * 1024 / bytes)));
			    while (imgEd.history.length > max) imgEd.history.shift();
			    while (imgEd.future.length > max) imgEd.future.shift();
			}
			function imgEdMarkDirty() {
			    imgEd.dirty = true;
			    imgEd.editGen++;
			    if (activeFile === imgEd.file) unsavedBadge.classList.remove('hidden');
			}
			// 変更前の状態を保存(スナップショットを返す)
			function imgEdPushHistory() {
			    const snap = imgEdClone(imgEd.img);
			    imgEd.history.push(snap);
			    imgEd.future = [];
			    imgEdTrimHistory();
			    imgEdMarkDirty();
			    imgEdUpdateUndoButtons();
			    return snap;
			}
			// 画像そのものを差し替える操作(リサイズ・回転など)
			function imgEdReplaceImage(newImg) {
			    imgEd.history.push(imgEd.img);
			    imgEd.future = [];
			    imgEd.img = newImg;
			    imgEdTrimHistory();
			    imgEdAfterReplace();
			}
			function imgEdAfterReplace() {
			    imgEdSyncCanvasSize();
			    imgEdRender();
			    imgEdMarkDirty();
			    imgEdUpdateUndoButtons();
			    imgEdUpdateSizeText();
			}
			function imgEdUndo() {
			    if (imgEd.stroke || !imgEd.img || !imgEd.history.length) return;
			    imgEd.future.push(imgEd.img);
			    imgEd.img = imgEd.history.pop();
			    imgEdAfterReplace();
			}
			function imgEdRedo() {
			    if (imgEd.stroke || !imgEd.img || !imgEd.future.length) return;
			    imgEd.history.push(imgEd.img);
			    imgEd.img = imgEd.future.pop();
			    imgEdAfterReplace();
			}

			/* ---------- ピクセル操作 ---------- */
			function imgEdRgb() {
			    const n = parseInt(imgEd.color.replace('#', ''), 16) || 0;
			    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
			}

			// 非プリマルチプライ RGBA への source-over 合成
			function imgEdBlendPixel(d, i, r, g, b, a) {
			    const da = d[i + 3] / 255;
			    const oa = a + da * (1 - a);
			    if (oa <= 0) return;
			    d[i]     = Math.round((r * a + d[i]     * da * (1 - a)) / oa);
			    d[i + 1] = Math.round((g * a + d[i + 1] * da * (1 - a)) / oa);
			    d[i + 2] = Math.round((b * a + d[i + 2] * da * (1 - a)) / oa);
			    d[i + 3] = Math.round(oa * 255);
			}

			function imgEdLinePoints(x0, y0, x1, y1, cb) {
			    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
			    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
			    let err = dx + dy;
			    for (;;) {
			        cb(x0, y0);
			        if (x0 === x1 && y0 === y1) break;
			        const e2 = 2 * err;
			        if (e2 >= dy) { err += dy; x0 += sx; }
			        if (e2 <= dx) { err += dx; y0 += sy; }
			    }
			}

			// ブラシを1回分スタンプ(1ストローク内では同じピクセルに二重適用しない)
			function imgEdStamp(cx, cy) {
			    const st = imgEd.stroke;
			    const img = imgEd.img, W = img.width, H = img.height, d = img.data;
			    const s = imgEd.size, x0 = cx - Math.floor(s / 2), y0 = cy - Math.floor(s / 2);
			    const round = imgEd.shape === 'round';
			    const rad = s / 2;
			    const a = imgEd.opacity / 100;
			    const [cr, cg, cb] = imgEdRgb();
			    const erase = st.tool === 'eraser';
			    let minX = W, minY = H, maxX = -1, maxY = -1;
			    for (let y = 0; y < s; y++) {
			        const py = y0 + y;
			        if (py < 0 || py >= H) continue;
			        for (let x = 0; x < s; x++) {
			            const px = x0 + x;
			            if (px < 0 || px >= W) continue;
			            if (round) {
			                const ddx = x + 0.5 - rad, ddy = y + 0.5 - rad;
			                if (ddx * ddx + ddy * ddy > rad * rad) continue;
			            }
			            const pi = py * W + px;
			            if (st.mask[pi]) continue;
			            st.mask[pi] = 1;
			            const i = pi * 4;
			            if (erase) d[i + 3] = Math.round(d[i + 3] * (1 - a));
			            else imgEdBlendPixel(d, i, cr, cg, cb, a);
			            if (px < minX) minX = px; if (px > maxX) maxX = px;
			            if (py < minY) minY = py; if (py > maxY) maxY = py;
			        }
			    }
			    if (maxX >= 0) {
			        const dr = st.dirty;
			        if (!dr) st.dirty = { x0: minX, y0: minY, x1: maxX, y1: maxY };
			        else {
			            dr.x0 = Math.min(dr.x0, minX); dr.y0 = Math.min(dr.y0, minY);
			            dr.x1 = Math.max(dr.x1, maxX); dr.y1 = Math.max(dr.y1, maxY);
			        }
			    }
			}

			function imgEdFlush() {
			    const st = imgEd.stroke;
			    if (!st || !st.dirty) return;
			    const r = st.dirty;
			    imgEdCtx.putImageData(imgEd.img, 0, 0, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1);
			    st.dirty = null;
			}

			function imgEdConstrain(tool, a, b) {
			    let dx = b.x - a.x, dy = b.y - a.y;
			    const ax = Math.abs(dx), ay = Math.abs(dy);
			    if (tool === 'line') {
			        if (ax > ay * 2) dy = 0;
			        else if (ay > ax * 2) dx = 0;
			        else { const m = Math.max(ax, ay); dx = (dx < 0 ? -1 : 1) * m; dy = (dy < 0 ? -1 : 1) * m; }
			    } else {
			        const m = Math.max(ax, ay);
			        dx = (dx < 0 ? -1 : 1) * m; dy = (dy < 0 ? -1 : 1) * m;
			    }
			    return { x: a.x + dx, y: a.y + dy };
			}

			// 直線・四角形・楕円: 開始時のスナップショットへ戻してから描き直す
			function imgEdDrawShape(shift) {
			    const st = imgEd.stroke;
			    const img = imgEd.img, W = img.width, H = img.height, d = img.data;
			    d.set(st.base.data);
			    const a = st.start;
			    const b = shift ? imgEdConstrain(st.tool, st.start, st.last) : st.last;

			    if (st.tool === 'line') {
			        st.mask.fill(0);
			        imgEdLinePoints(a.x, a.y, b.x, b.y, (x, y) => imgEdStamp(x, y));
			        st.dirty = null;
			    } else {
			        const [cr, cg, cb] = imgEdRgb();
			        const alpha = imgEd.opacity / 100, s = imgEd.size, fill = imgEd.fillShape;
			        const x0 = Math.min(a.x, b.x), x1 = Math.max(a.x, b.x);
			        const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
			        const sy = Math.max(0, y0), ey = Math.min(H - 1, y1);
			        const sx = Math.max(0, x0), ex = Math.min(W - 1, x1);
			        if (st.tool === 'rect') {
			            for (let y = sy; y <= ey; y++) {
			                for (let x = sx; x <= ex; x++) {
			                    if (fill || x < x0 + s || x > x1 - s || y < y0 + s || y > y1 - s) {
			                        imgEdBlendPixel(d
