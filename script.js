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
			const texturesView = document.getElementById('texturesView');
			const modeBtnTextures = document.getElementById('modeBtnTextures');
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
			    initProjects();
			    initTextureMode();
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
			        alert(t("先にパックを読み込んでください。"));
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
			                modifiedContent: jsonPrettyCompact(rpManifest)
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
			                modifiedContent: jsonPrettyCompact(bpManifest)
			            }
			        ],
			        emptyFolders: new Set(),
			        iconBlob: null,
			        iconUrl: null
			    };
			}

			function createNewProject(name, type) {
			    showLoading(true, "新規パック作成中...");
			    setTimeout(() => {
			        const isTexture = type === 'texture';
			        const rp = buildDefaultRpPack();
			        const bp = isTexture ? null : buildDefaultBpPack(rp.manifest.header.uuid);
			        if (isTexture && rp.emptyFolders && rp.emptyFolders.add) {
			            ['blocks', 'items', 'entity', 'ui', 'environment'].forEach(d => rp.emptyFolders.add('textures/' + d));
			        }

			        importedArchiveName = null;
			        packsData = { bp, rp };
			        resetImageEditorState();
			        beginNewProject();
			        projectName = name.slice(0, PROJECT_NAME_MAX);
			        projectType = PROJECT_TYPES[type] ? type : DEFAULT_PROJECT_TYPE;

			        currentTab = isTexture ? 'rp' : 'bp';
			        selectedFolderPath = "";
			        selectedFilePath = "";
			        openFoldersSet.clear();
			        textureCategory = 'all'; textureSearch = ''; textureShown = TEXTURE_PAGE;

			        homeView.classList.add('hidden');
			        editorView.classList.remove('hidden');
			        exportBtn.classList.remove('hidden');

			        updatePackIconsAndHeader();
			        switchPackTab(currentTab);
			        applyProjectTypeUi();
			        showLoading(false);
			    }, 300);
			}

			/* --- 新規作成ダイアログ --- */
			let newProjectType = 'addon';
			function openNewProjectModal() {
			    const input = document.getElementById('newProjectName');
			    input.value = '';
			    document.getElementById('newProjectError').classList.add('hidden');
			    selectNewProjectType('addon');
			    document.getElementById('newProjectModal').classList.remove('hidden');
			    setTimeout(() => input.focus(), 0);
			}
			function closeNewProjectModal() { document.getElementById('newProjectModal').classList.add('hidden'); }
			function selectNewProjectType(type) {
			    newProjectType = type;
			    document.querySelectorAll('[data-newtype]').forEach(b => {
			        const on = b.dataset.newtype === type;
			        b.className = 'text-left p-3 rounded-xl border transition-all ' + (on
			            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
			            : 'bg-mc-dark border-mc-border text-slate-300 hover:border-emerald-500/50');
			    });
			}
			function confirmNewProject() {
			    const name = document.getElementById('newProjectName').value.trim();
			    if (!name) { document.getElementById('newProjectError').classList.remove('hidden'); return; }
			    closeNewProjectModal();
			    createNewProject(name, newProjectType);
			}

			/* --- テクスチャプロジェクトの画面 --- */
			const TEXTURE_PAGE = 120;
			let textureCategory = 'all', textureSearch = '', textureShown = TEXTURE_PAGE, textureUrls = [], textureRenderToken = 0;

			function applyProjectTypeUi() {
			    const tex = projectType === 'texture';
			    if (tex) { textureSource = 'vanilla'; restoreVanilla().then(renderTextureGallery); }
			    document.getElementById('packTabsBox').style.display = tex ? 'none' : '';
			    tabBtnBP.classList.toggle('hidden', tex);
			    switchViewMode(tex ? 'textures' : (currentViewMode === 'textures' ? 'manifest' : currentViewMode));
			}

			function getTextureFiles() {
			    const pack = packsData.rp;
			    if (!pack) return [];
			    if (textureSource === 'vanilla') return (vanillaIndex || []).map(v => ({ f: v, cat: v.cat, name: v.name }));
			    return pack.files.filter(f => /^textures\/.+\.(png|jpe?g)$/i.test(f.path)).map(f => {
			        const parts = f.path.split('/');
			        return { f, cat: texCat(f.path), name: parts[parts.length - 1] };
			    });
			}

			let textureSource = 'vanilla', vanillaIndex = null;
			const VANILLA_KEY = 'vanilla|zip';
			const TEX_CAT_JA = { all: 'すべて', blocks: 'ブロック', items: 'アイテム', entity: 'モブ・乗り物', armor: '防具（着用）', trims: '防具の装飾', destroy: 'ブロック破壊の亀裂', sky: '空・天気', particle: 'パーティクル', ui: 'UI（ゲージ・アイコン）', gui: '画面・メニュー', painting: '絵画', map: 'マップ', colormap: '色（草・葉）', other: 'その他' };
			const TEX_CAT_ORDER = ['blocks', 'items', 'entity', 'armor', 'trims', 'destroy', 'sky', 'particle', 'ui', 'gui', 'painting', 'map', 'colormap', 'other'];
			const TEX_CAT_DIR = { blocks: 'blocks', items: 'items', entity: 'entity', armor: 'models/armor', trims: 'trims', destroy: 'environment', sky: 'environment', particle: 'particle', ui: 'ui', gui: 'gui', painting: 'painting', map: 'map', colormap: 'colormap' };
			function texCat(path) {
			    const p = path.toLowerCase().split('/'), d = p[1] || '';
			    if (p.length < 3) return 'other';
			    if (d === 'environment') return p[2].startsWith('destroy_stage_') ? 'destroy' : 'sky';
			    if (d === 'models') return p[2] === 'armor' ? 'armor' : 'other';
			    if (d === 'particles') return 'particle';
			    return (d !== 'all' && d !== 'other' && TEX_CAT_JA[d]) ? d : 'other';
			}
			const TEX_JA = { '剣': 'sword', '斧': 'axe', 'ツルハシ': 'pickaxe', 'つるはし': 'pickaxe', 'シャベル': 'shovel', 'クワ': 'hoe', '弓': 'bow', 'クロスボウ': 'crossbow', '矢': 'arrow', 'ダイヤ': 'diamond', '鉄': 'iron', '金': 'gold', '石': 'stone', '木': 'wood', 'ネザライト': 'netherite', 'ヘルメット': 'helmet', 'チェストプレート': 'chestplate', 'レギンス': 'leggings', 'ブーツ': 'boots', '防具': 'armor', 'りんご': 'apple', 'リンゴ': 'apple', 'ポーション': 'potion', '金のリンゴ': 'golden_apple', 'ハート': 'heart', 'ハンバー': 'hunger', '草': 'grass', '土': 'dirt', '砂': 'sand', '丸石': 'cobblestone', '黒曜石': 'obsidian', '羊毛': 'wool', 'ガラス': 'glass', '炎': 'fire', '火': 'fire', '空': 'sky', '雲': 'cloud', '太陽': 'sun', '月': 'moon', 'ベッド': 'bed', 'TNT': 'tnt', 'ブロック': 'block', 'アイテム': 'item', 'エンダー': 'ender', 'パール': 'pearl', '盾': 'shield', 'トライデント': 'trident' };
			function texQueryTokens(q) {
			    return q.trim().toLowerCase().split(/\s+/).filter(Boolean).map(w => {
			        for (const k in TEX_JA) if (w.includes(k.toLowerCase())) return TEX_JA[k];
			        return w;
			    });
			}

			async function loadVanillaFromBlob(blob) {
			    const zip = await JSZip.loadAsync(blob);
			    const idx = [];
			    zip.forEach((path, entry) => {
			        if (entry.dir || path.startsWith('__MACOSX')) return;
			        const m = /(?:^|\/)(textures\/.+\.png)$/i.exec(path);
			        if (!m) return;
			        const parts = m[1].split('/');
			        idx.push({ path: m[1], entry, cat: texCat(m[1]), name: parts[parts.length - 1] });
			    });
			    if (!idx.length) throw new Error('textures フォルダが見つかりません');
			    vanillaIndex = idx;
			}

			async function restoreVanilla() {
			    if (vanillaIndex) return;
			    // ① HTMLと同じ場所の resource_pack フォルダ + vanilla_index.json があれば自動で使う
			    try {
			        const r = await fetch('vanilla_index.json');
			        if (r.ok) {
			            const j = await r.json();
			            const root = (j.root || 'resource_pack').replace(/\/$/, '');
			            vanillaIndex = j.files.map(path => {
			                const parts = path.split('/');
			                const entry = { async(type) { return fetch(root + '/' + path.split('/').map(encodeURIComponent).join('/')).then(res => { if (!res.ok) throw new Error(path); return type === 'blob' ? res.blob() : res.arrayBuffer().then(b => new Uint8Array(b)); }); } };
			                return { path, entry, cat: texCat(path), name: parts[parts.length - 1] };
			            });
			            return;
			        }
			    } catch (e) { /* file:// などでは読めないので、次の方法へ */ }
			    // ② 以前に選んだzipが保存されていればそれを使う
			    if (!projectDbOk) return;
			    try {
			        const db = await openProjectDb();
			        const rec = await idbRequest(db.transaction('files').objectStore('files').get(VANILLA_KEY));
			        if (rec && rec.data) await loadVanillaFromBlob(rec.data);
			    } catch (e) { console.error(e); }
			}

			async function pickVanillaZip(file) {
			    if (!file) return;
			    showLoading(true, 'バニラテクスチャを読み込み中...', '容量が大きいため、少し時間がかかります');
			    try {
			        await loadVanillaFromBlob(file);
			        try { const db = await openProjectDb(); await idbRequest(db.transaction('files', 'readwrite').objectStore('files').put({ k: VANILLA_KEY, data: file })); } catch (e) { console.error(e); }
			    } catch (e) { alert(t('読み込めませんでした: ') + t(e.message)); }
			    showLoading(false);
			    renderTextureGallery();
			}

			function setTextureSource(src) {
			    textureSource = src; textureCategory = 'all'; textureShown = TEXTURE_PAGE;
			    restoreVanilla().then(renderTextureGallery);
			    renderTextureGallery();
			}

			async function textureBlobUrl(f) {
			    if (f.entry) return URL.createObjectURL(await f.entry.async('blob'));
			    const mc = f.modifiedContent;
			    let blob = null;
			    if (mc !== null && mc !== undefined) blob = new Blob([mc], { type: 'image/png' });
			    else if (f.zipObj) blob = await f.zipObj.async('blob');
			    return blob ? URL.createObjectURL(blob) : null;
			}

			async function renderTextureGallery() {
			    const token = ++textureRenderToken;
			    const pack = packsData.rp;
			    const grid = document.getElementById('textureGrid');
			    if (!pack || !grid) return;
			    const all = getTextureFiles();
			    const counts = {};
			    all.forEach(x => { counts[x.cat] = (counts[x.cat] || 0) + 1; });
			    Array.from(pack.emptyFolders || []).forEach(p => {
			        const m = /^textures\/([^/]+)$/.exec(p);
			        if (m) { const c = texCat('textures/' + m[1] + '/x.png'); if (!(c in counts)) counts[c] = 0; }
			    });
			    if (textureCategory !== 'all' && !(textureCategory in counts)) textureCategory = 'all';

			    const chips = document.getElementById('textureCategories');
			    chips.innerHTML = '';
			    [['all', all.length]].concat(Object.keys(counts).sort((x, y) => TEX_CAT_ORDER.indexOf(x) - TEX_CAT_ORDER.indexOf(y)).map(c => [c, counts[c]])).forEach(([cat, n]) => {
			        const b = document.createElement('button');
			        b.type = 'button';
			        b.className = 'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ' + (cat === textureCategory
			            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
			            : 'text-slate-400 hover:text-white border-mc-border');
			        b.textContent = t(TEX_CAT_JA[cat] || cat) + ' ' + n;
			        b.addEventListener('click', () => { textureCategory = cat; textureShown = TEXTURE_PAGE; renderTextureGallery(); });
			        chips.appendChild(b);
			    });

			    const q = textureSearch.trim().toLowerCase();
			    const list = all.filter(x => (textureCategory === 'all' || x.cat === textureCategory) && (!q || texQueryTokens(q).every(w => x.f.path.toLowerCase().includes(w))))
			        .sort((a, b) => a.f.path.localeCompare(b.f.path));
			    document.getElementById('textureCount').textContent = list.length + ' / ' + all.length;
			    document.getElementById('textureMoreBtn').classList.toggle('hidden', list.length <= textureShown);

			    textureUrls.forEach(u => URL.revokeObjectURL(u));
			    textureUrls = [];
			    grid.innerHTML = '';
			    ['vanilla', 'project'].forEach(k => { const b = document.getElementById('texSrc_' + k); if (b) b.className = 'flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all ' + (k === textureSource ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'text-slate-400 hover:text-white border-mc-border'); });
			    document.getElementById('texVanillaLoader').classList.toggle('hidden', !(textureSource === 'vanilla' && !vanillaIndex));
			    if (!list.length) {
			        grid.innerHTML = textureSource === 'vanilla' && !vanillaIndex ? '' : '<div class="col-span-full border border-dashed border-mc-border rounded-xl p-6 text-center text-xs text-slate-500">' + (textureSource === 'vanilla' ? '見つかりませんでした。別のキーワードを試してください。' : 'まだ編集したテクスチャがありません。「バニラから探す」で選ぶと、ここに追加されます。') + '</div>';
			        return;
			    }
			    for (const x of list.slice(0, textureShown)) {
			        const card = document.createElement('button');
			        card.type = 'button';
			        card.title = x.f.path;
			        card.className = 'bg-mc-card border border-mc-border hover:border-emerald-500/60 rounded-xl p-2 flex flex-col items-center gap-1 transition-all min-w-0';
			        card.innerHTML = '<div class="w-full aspect-square bg-mc-dark rounded-lg flex items-center justify-center overflow-hidden"><img class="max-w-full max-h-full image-render-pixelated" alt=""></div><span data-no-i18n class="text-[10px] font-mono text-slate-300 truncate w-full text-center"></span><span data-no-i18n class="text-[9px] font-mono text-slate-500"></span>';
			        card.children[1].textContent = x.name;
			        card.addEventListener('click', () => openTextureInEditor(x.f));
			        grid.appendChild(card);
			        const img = card.querySelector('img'), dim = card.children[2];
			        textureBlobUrl(x.f).then(url => {
			            if (!url) return;
			            if (token !== textureRenderToken) { URL.revokeObjectURL(url); return; }
			            textureUrls.push(url);
			            img.onload = () => { dim.textContent = img.naturalWidth + '×' + img.naturalHeight; };
			            img.src = url;
			        }).catch(() => {});
			    }
			}

			async function openTextureInEditor(f) {
			    if (f.entry) {
			        const pack = packsData.rp;
			        let ex = pack.files.find(x => x.path === f.path);
			        if (!ex) {
			            ex = { path: f.path, fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + f.path, zipObj: null, modifiedContent: await f.entry.async('uint8array') };
			            pack.files.push(ex);
			            scheduleProjectSave();
			        }
			        f = ex;
			    }
			    let acc = '';
			    f.path.split('/').slice(0, -1).forEach(p => { acc = acc ? acc + '/' + p : p; openFoldersSet.add(acc); });
			    selectedFilePath = f.path;
			    switchViewMode('files');
			    renderCurrentPackTree();
			    openFileInEditor(f);
			}

			async function addTextureFiles(fileList) {
			    const pack = packsData.rp;
			    if (!pack) return;
			    const dir = 'textures/' + (TEX_CAT_DIR[textureCategory] || 'blocks');
			    for (const file of Array.from(fileList)) {
			        if (!/\.(png|jpe?g)$/i.test(file.name)) continue;
			        const path = dir + '/' + file.name.toLowerCase().replace(/\s+/g, '_');
			        const data = new Uint8Array(await file.arrayBuffer());
			        const ex = pack.files.find(f => f.path === path);
			        if (ex) ex.modifiedContent = data;
			        else pack.files.push({ path, fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + path, zipObj: null, modifiedContent: data });
			    }
			    document.getElementById('textureFileInput').value = '';
			    renderTextureGallery();
			    renderCurrentPackTree();
			    scheduleProjectSave();
			}

			function initTextureMode() {
			    document.getElementById('textureSearch').addEventListener('input', (e) => { textureSearch = e.target.value; textureShown = TEXTURE_PAGE; renderTextureGallery(); });
			    document.getElementById('textureFileInput').addEventListener('change', (e) => addTextureFiles(e.target.files));
			    document.getElementById('vanillaZipInput').addEventListener('change', (e) => { pickVanillaZip(e.target.files[0]); e.target.value = ''; });
			    restoreVanilla();
			    document.getElementById('newProjectName').addEventListener('keydown', (e) => {
			        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); confirmNewProject(); }
			        else if (e.key === 'Escape') closeNewProjectModal();
			    });
			}

			function requestReturnHome() {
			    if (packsData.bp || packsData.rp) {
			        document.getElementById('resetModal').classList.remove('hidden');
			    }
			}

			function closeResetModal() {
			    document.getElementById('resetModal').classList.add('hidden');
			}

			async function confirmReturnHome() {
			    closeResetModal();
			    stopAudioPlayback();
			    await flushProjectSave(); // 閉じる前に最新の編集内容を保存する
			    currentProjectId = null;
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
			    renderProjectList();
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
			    currentProjectId = null;
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
			        alert(t("ファイルの解析に失敗しました: ") + t(err.message));
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
			    if (!currentProjectId) beginNewProject();
			    if (packsData.bp) currentTab = 'bp';
			    else if (packsData.rp) currentTab = 'rp';

			    updatePackIconsAndHeader();
			    switchPackTab(currentTab);
			    applyProjectTypeUi();

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

			    document.getElementById('packTabsBox').style.display = projectType === 'texture' ? 'none' : '';
			    tabBtnBP.classList.toggle('hidden', projectType === 'texture');
			    populateManifestForm();
			    renderCurrentPackTree();
			    validateAllPacks();
			}

			function switchViewMode(mode) {
			    currentViewMode = mode;
			    const on = "flex-1 justify-center whitespace-nowrap min-w-0 px-1 py-1.5 text-[11px] sm:text-xs sm:flex-none sm:px-3 rounded-lg flex items-center gap-1 sm:gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
			    const off = "flex-1 justify-center whitespace-nowrap min-w-0 px-1 py-1.5 text-[11px] sm:text-xs sm:flex-none sm:px-3 rounded-lg flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-white border border-transparent";
			    const views = { manifest: [manifestEditorView, 'flex', modeBtnManifest], files: [filesEditorView, 'grid', modeBtnFiles], textures: [texturesView, 'flex', modeBtnTextures] };
			    Object.keys(views).forEach(k => {
			        const [el, display, btn] = views[k];
			        el.classList.toggle('hidden', k !== mode);
			        el.classList.toggle(display, k === mode);
			        btn.className = k === mode ? on : off;
			    });
			    modeBtnTextures.classList.toggle('hidden', projectType !== 'texture');

			    // ファイル編集ビュー表示時、開いているテキストがあれば高さを再計算する
			    if (mode === 'files' && activeFile && !codeEditorArea.classList.contains('hidden')) {
			        requestAnimationFrame(autoResizeTextarea);
			    }
			    if (mode === 'textures') renderTextureGallery();
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

			    getUniqueScriptEntryNames();
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

			// 入力欄のスクリプト名を集め、重複があれば赤枠と警告で知らせる。戻り値は重複を除いた名前一覧。
			function getUniqueScriptEntryNames() {
			    const seen = new Set();
			    const names = [];
			    let hasDup = false;
			    document.querySelectorAll('.script-entry-val').forEach(ipt => {
			        const wrap = ipt.parentElement;
			        const name = ipt.value.trim();
			        let dup = false;
			        if (name) {
			            const key = name.toLowerCase();
			            if (seen.has(key)) dup = true;
			            else { seen.add(key); names.push(name); }
			        }
			        if (dup) hasDup = true;
			        if (wrap) wrap.classList.toggle('script-entry-dup', dup);
			    });
			    const warn = document.getElementById('scriptDupWarning');
			    if (warn) warn.classList.toggle('hidden', !hasDup);
			    return names;
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

			        // 重複した名前は2つ目以降をマニフェスト/ファイルに反映しない(大文字小文字も同一視)
			        const validNames = getUniqueScriptEntryNames();
			        validNames.forEach(name => {
			            manifest.modules.push({
			                type: "script",
			                language: "javascript",
			                uuid: generateUuid(),
			                entry: `scripts/${name}.js`,
			                version: [1, 0, 0]
			            });
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
			    const newManifestStr = jsonPrettyCompact(manifest);
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
			    closeTreeMenu();
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
			        rowDiv.className = `tree-row flex items-center justify-between py-1 px-2 rounded-lg cursor-pointer transition-colors group select-none ${isSelected ? 'bg-mc-border text-white font-bold' : 'hover:bg-mc-border/60 text-slate-300'}`;

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

			        const actionDiv = buildRowActions('folder', folderPath);

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
			        fileRow.className = `tree-row flex items-center justify-between py-1 px-2 my-0.5 rounded-lg cursor-pointer transition-colors group select-none ${isSelected ? 'bg-mc-border text-white font-bold' : 'hover:bg-mc-border/60 text-slate-300'}`;

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

			        const actionDiv = buildRowActions('file', file.path);

			        fileRow.appendChild(leftSpan);
			        fileRow.appendChild(actionDiv);
			        container.appendChild(fileRow);
			    });
			}

			function setupCodeEditorEvents() {
			    codeTextarea.addEventListener('input', () => {
			        updateLineNumbers();
			        applyTextEdit();
			    });
			    codeTextarea.addEventListener('keydown', (e) => {
			        if (e.key === 'Tab') {
			            e.preventDefault();
			            const start = codeTextarea.selectionStart;
			            const end = codeTextarea.selectionEnd;
			            codeTextarea.value = codeTextarea.value.substring(0, start) + "  " + codeTextarea.value.substring(end);
			            codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
			            updateLineNumbers();
			            applyTextEdit();
			        }
			    });
			}

			// テキストの編集内容は入力のたびに即座にファイルへ反映する(手動の「適用」は不要)
			let manifestSyncTimer = null;
			function findPackOfFile(file) {
			    return [packsData.bp, packsData.rp].find(p => p && p.files.includes(file)) || null;
			}
			function applyTextEdit() {
			    if (!activeFile || codeEditorArea.classList.contains('hidden')) return;
			    const ext = activeFile.path.split('.').pop().toLowerCase();
			    if (!TEXT_EXTENSIONS.includes(ext)) return;
			    activeFile.modifiedContent = codeTextarea.value;
			    if (activeFile.path === 'manifest.json') {
			        clearTimeout(manifestSyncTimer);
			        manifestSyncTimer = setTimeout(syncManifestFromEditor, 400);
			    }
			}
			function syncManifestFromEditor() {
			    if (!activeFile || activeFile.path !== 'manifest.json') return;
			    const pack = findPackOfFile(activeFile);
			    if (!pack) return;
			    let parsed;
			    try { parsed = JSON.parse(codeTextarea.value); } catch (e) { return; } // 入力途中の不正なJSONは無視
			    pack.manifest = parsed;
			    if (packsData[currentTab] === pack) populateManifestForm();
			    updatePackHeaderPreview();
			    validateAllPacks();
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
			            if (activeFile === file) alert(t('この画像はエディタで開けませんでした(' + err.message + ')。プレビュー表示に切り替えます。'));
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

			// 編集中のファイル1つだけをダウンロードする
			async function fileToBlob(file) {
			    const mc = file.modifiedContent;
			    if (mc !== null && mc !== undefined) return new Blob([mc]);
			    if (file.zipObj) return await file.zipObj.async('blob');
			    return null;
			}
			async function downloadSingleFile(file) {
			    const blob = await fileToBlob(file);
			    if (!blob) { alert(t('ファイルデータが見つかりません')); return; }
			    downloadBlob(blob, file.path.split('/').pop());
			}
			async function exportCurrentFile() {
			    if (!activeFile) return;
			    try {
			        await commitImageEditorIfDirty();
			        await downloadSingleFile(activeFile);
			    } catch (err) {
			        console.error(err);
			        alert(t('出力エラーが発生しました: ') + t(err.message));
			    }
			}

			// JSON整形: 数値配列などの短い配列/オブジェクトは1行にまとめ、長い場合だけ展開する
			// (Blockbenchのgeoファイル等でよく使われる書式に合わせ、読みやすさを優先する)
			function jsonPrettyCompact(value, indent = 2, maxLineLength = 100) {
			    const pad = (n) => ' '.repeat(indent * n);
			    // オブジェクトは常に1キーずつ改行して展開する(短くても1行にまとめない)。
			    // 配列は、中身がすべて数値/文字列/真偽値/nullのような "値" だけなら
			    // 1行に収まる範囲で1行にまとめる(座標・UV配列などを読みやすくするため)。
			    // 配列の中にオブジェクトや配列が1つでも含まれる場合は、常に1要素ずつ展開する。
			    const isPrimitive = (v) => v === null || typeof v !== 'object';
			    function go(val, depth) {
			        if (val === null || typeof val !== 'object') return JSON.stringify(val);
			        if (Array.isArray(val)) {
			            if (val.length === 0) return '[]';
			            if (val.every(isPrimitive)) {
			                const line = '[' + val.map(v => JSON.stringify(v)).join(', ') + ']';
			                if (pad(depth).length + line.length <= maxLineLength) return line;
			            }
			            const items = val.map(v => pad(depth + 1) + go(v, depth + 1));
			            return '[\n' + items.join(',\n') + '\n' + pad(depth) + ']';
			        }
			        const keys = Object.keys(val);
			        if (keys.length === 0) return '{}';
			        const items = keys.map(k => pad(depth + 1) + JSON.stringify(k) + ': ' + go(val[k], depth + 1));
			        return '{\n' + items.join(',\n') + '\n' + pad(depth) + '}';
			    }
			    return go(value, 0);
			}

			function formatCode() {
			    if (!activeFile) return;
			    try {
			        const parsed = JSON.parse(codeTextarea.value);
			        const formatted = jsonPrettyCompact(parsed);
			        codeTextarea.value = formatted;
			        updateLineNumbers();

			        // 整形結果を即座に保存する（バグ①対策）
			        const ext = activeFile.path.split('.').pop().toLowerCase();
			        if (TEXT_EXTENSIONS.includes(ext)) {
			            activeFile.modifiedContent = formatted;
			        }

			        // manifest.json ならフォーム側にも反映
			        if (activeFile.path === 'manifest.json') {
			            try {
			                packsData[currentTab].manifest = JSON.parse(formatted);
			                populateManifestForm();
			            } catch (e) {}
			        }
			    } catch (e) {
			        alert(t("JSONの構文にエラーがあるため整形できませんでした。"));
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
			    if (!pack) { alert(t("パックが読み込まれていません。")); return; }
			    currentModalMode = "file";
			    modalTargetDir = getTargetDirectory();
			    document.getElementById('modalTypeIcon').innerHTML = `<i data-lucide="file-plus" class="w-4 h-4"></i>`;
			    document.getElementById('modalTypeTitle').textContent = "新規ファイル作成";
			    document.getElementById('modalTargetPath').textContent = getTargetPathDisplay();
			    document.getElementById('modalItemName').value = "";
			    document.getElementById('modalItemName').placeholder = "例: item.json";
			    document.getElementById('fileNameInputBlock').classList.remove('hidden');
			    setNewImageSize(16);
			    updateNewFileImageBlock();
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function promptCreateNewFolder() {
			    const pack = packsData[currentTab];
			    if (!pack) { alert(t("パックが読み込まれていません。")); return; }
			    currentModalMode = "folder";
			    modalTargetDir = getTargetDirectory();
			    document.getElementById('modalTypeIcon').innerHTML = `<i data-lucide="folder-plus" class="w-4 h-4"></i>`;
			    document.getElementById('modalTypeTitle').textContent = "新規フォルダ作成";
			    document.getElementById('modalTargetPath').textContent = getTargetPathDisplay();
			    document.getElementById('modalItemName').value = "";
			    document.getElementById('modalItemName').placeholder = "フォルダ名";
			    document.getElementById('fileNameInputBlock').classList.remove('hidden');
			    document.getElementById('imageSizeInputBlock').classList.add('hidden');
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function triggerCustomFileInput() {
			    const pack = packsData[currentTab];
			    if (!pack) { alert(t("パックが読み込まれていません。")); return; }
			    customFileInput.click();
			}

			function handleImportCustomFiles(event) {
			    const files = event.target.files;
			    if (!files || files.length === 0) return;

			    for (let i = 0; i < files.length; i++) {
			        const name = files[i].name;
			        if (!name.includes('.')) {
			            alert(t(`ファイル "${name}" に拡張子がありません。拡張子のないファイルは追加できません。`));
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
			    document.getElementById('imageSizeInputBlock').classList.add('hidden');
			    document.getElementById('modalErrorAlert').classList.add('hidden');
			    document.getElementById('createItemModal').classList.remove('hidden');
			    lucide.createIcons();
			}

			function closeCreateItemModal() {
			    document.getElementById('createItemModal').classList.add('hidden');
			    pendingImportFiles = null;
			    customFileInput.value = '';
			}

			// ファイル名の拡張子が画像形式のとき、画像サイズの入力欄を表示する
			function updateNewFileImageBlock() {
			    const name = document.getElementById('modalItemName').value.trim();
			    const dot = name.lastIndexOf('.');
			    const ext = dot > 0 ? name.substring(dot + 1).toLowerCase() : '';
			    const show = currentModalMode === 'file' && IMAGE_EXTENSIONS.includes(ext);
			    document.getElementById('imageSizeInputBlock').classList.toggle('hidden', !show);
			}
			function setNewImageSize(n) {
			    document.getElementById('modalImgW').value = n;
			    document.getElementById('modalImgH').value = n;
			}
			document.getElementById('modalItemName').addEventListener('input', updateNewFileImageBlock);

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

			        // 画像ファイルは、指定サイズの透明な画像を実データとして生成する
			        let initialContent = "";
			        const newExt = name.substring(dotIdx + 1).toLowerCase();
			        if (IMAGE_EXTENSIONS.includes(newExt)) {
			            const w = parseInt(document.getElementById('modalImgW').value, 10);
			            const h = parseInt(document.getElementById('modalImgH').value, 10);
			            if (!(w >= 1 && h >= 1) || w > IMG_ED_MAX_SIZE || h > IMG_ED_MAX_SIZE) {
			                showModalError(`幅と高さは 1〜${IMG_ED_MAX_SIZE} の整数で入力してください。`);
			                return;
			            }
			            try {
			                initialContent = await imgEdEncode(new ImageData(w, h), newExt);
			            } catch (err) {
			                console.error(err);
			                showModalError(t('画像のエンコードに失敗しました'));
			                return;
			            }
			        }

			        const newFileObj = {
			            path: newPath,
			            fullZipPath: (pack.rootPrefix === '/' ? '' : pack.rootPrefix) + newPath,
			            zipObj: null,
			            modifiedContent: initialContent
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

			/* --- ツリー行の操作ボタン(出力 / 移動 / 名前変更 / 削除) --- */
			function getTreeActions(kind, path) {
			    const isFile = kind === 'file';
			    return [
			        { icon: 'download', label: 'エクスポート', run: () => exportTreeItem(kind, path) },
			        { icon: 'folder-input', label: '移動', run: () => promptMoveItem(kind, path) },
			        { icon: 'edit-2', label: '名前変更', run: () => isFile ? promptRenameFile(path) : promptRenameFolder(path) },
			        { icon: 'trash-2', label: isFile ? 'ファイルを削除' : 'フォルダを削除', danger: true,
			          run: () => isFile ? promptDeleteFile(path) : promptDeleteFolder(path) }
			    ];
			}

			// 幅に余裕があるときはボタンを並べ、狭いとき(スマホ・深い階層)は CSS が「⋮」に切り替える
			function buildRowActions(kind, path) {
			    const actions = getTreeActions(kind, path);
			    const wrap = document.createElement('div');
			    wrap.className = 'flex items-center shrink-0';

			    const inline = document.createElement('div');
			    inline.className = 'tree-actions-inline';
			    actions.forEach(a => {
			        const b = document.createElement('button');
			        b.type = 'button';
			        b.className = 'tree-act-btn' + (a.danger ? ' danger' : '');
			        b.setAttribute('title', a.label);
			        b.innerHTML = `<i data-lucide="${a.icon}" class="w-3 h-3"></i>`;
			        b.addEventListener('click', (e) => { e.stopPropagation(); a.run(); });
			        inline.appendChild(b);
			    });

			    const more = document.createElement('div');
			    more.className = 'tree-actions-more';
			    const mb = document.createElement('button');
			    mb.type = 'button';
			    mb.className = 'tree-act-btn';
			    mb.setAttribute('data-tree-more', '1');
			    mb.setAttribute('title', 'その他の操作');
			    mb.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
			    mb.addEventListener('click', (e) => {
			        e.stopPropagation();
			        openTreeMenu(mb, actions);
			    });
			    more.appendChild(mb);

			    wrap.appendChild(inline);
			    wrap.appendChild(more);
			    return wrap;
			}

			let treeMenuEl = null, treeMenuAnchor = null;
			function closeTreeMenu() {
			    if (treeMenuEl) { treeMenuEl.remove(); treeMenuEl = null; treeMenuAnchor = null; }
			}
			function openTreeMenu(anchor, actions) {
			    if (treeMenuEl && treeMenuAnchor === anchor) { closeTreeMenu(); return; }
			    closeTreeMenu();
			    const menu = document.createElement('div');
			    menu.className = 'tree-menu';
			    menu.addEventListener('click', (e) => e.stopPropagation()); // body の選択解除を防ぐ
			    actions.forEach(a => {
			        const item = document.createElement('button');
			        item.type = 'button';
			        item.className = 'tree-menu-item' + (a.danger ? ' danger' : '');
			        item.innerHTML = `<i data-lucide="${a.icon}" class="w-3.5 h-3.5 shrink-0"></i><span></span>`;
			        item.lastChild.textContent = a.label;
			        item.addEventListener('click', () => { closeTreeMenu(); a.run(); });
			        menu.appendChild(item);
			    });
			    document.body.appendChild(menu);
			    treeMenuEl = menu;
			    treeMenuAnchor = anchor;
			    lucide.createIcons();

			    const r = anchor.getBoundingClientRect();
			    const mw = menu.offsetWidth, mh = menu.offsetHeight;
			    const left = Math.min(Math.max(8, r.right - mw), window.innerWidth - mw - 8);
			    let top = r.bottom + 4;
			    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
			    menu.style.left = left + 'px';
			    menu.style.top = top + 'px';
			}
			document.addEventListener('pointerdown', (e) => {
			    if (!treeMenuEl) return;
			    if (treeMenuEl.contains(e.target) || (e.target.closest && e.target.closest('[data-tree-more]'))) return;
			    closeTreeMenu();
			}, true);
			document.addEventListener('scroll', closeTreeMenu, true);
			window.addEventListener('resize', closeTreeMenu);
			document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTreeMenu(); });

			/* --- ファイル / フォルダ単体のエクスポート --- */
			async function exportTreeItem(kind, path) {
			    const pack = packsData[currentTab];
			    if (!pack) return;
			    try {
			        await commitImageEditorIfDirty();
			        if (kind === 'file') {
			            const f = pack.files.find(x => x.path === path);
			            if (f) await downloadSingleFile(f);
			            return;
			        }

			        showLoading(true, "フォルダを圧縮中...", "ファイルをパッケージングしています");
			        const base = path.split('/').pop();
			        const prefix = path + '/';
			        const zip = new JSZip();
			        const root = zip.folder(base);
			        if (pack.emptyFolders) {
			            for (const fp of pack.emptyFolders) {
			                if (fp.startsWith(prefix)) root.folder(fp.substring(prefix.length));
			            }
			        }
			        for (const f of pack.files) {
			            if (!f.path.startsWith(prefix) || f.path.endsWith('/.keep')) continue;
			            const rel = f.path.substring(prefix.length);
			            if (f.modifiedContent !== null && f.modifiedContent !== undefined) {
			                root.file(rel, f.modifiedContent);
			            } else if (f.zipObj) {
			                root.file(rel, await f.zipObj.async('uint8array'));
			            }
			        }
			        const blob = await zip.generateAsync({ type: 'blob' });
			        downloadBlob(blob, `${base}.zip`);
			    } catch (err) {
			        console.error(err);
			        alert(t('出力エラーが発生しました: ') + t(err.message));
			    } finally {
			        if (kind === 'folder') showLoading(false);
			    }
			}

			/* --- Move Item(ファイル / フォルダの移動) --- */
			let moveTarget = null;
			let moveDest = null;

			function cmpPath(a, b) {
			    const A = a.split('/'), B = b.split('/');
			    const n = Math.min(A.length, B.length);
			    for (let i = 0; i < n; i++) {
			        const c = A[i].localeCompare(B[i]);
			        if (c) return c;
			    }
			    return A.length - B.length;
			}

			function collectAllFolders(pack) {
			    const set = new Set();
			    const add = (fp) => {
			        let cur = '';
			        fp.split('/').forEach(part => {
			            if (!part) return;
			            cur = cur ? cur + '/' + part : part;
			            set.add(cur);
			        });
			    };
			    pack.files.forEach(f => {
			        const i = f.path.lastIndexOf('/');
			        if (i > 0) add(f.path.substring(0, i));
			    });
			    if (pack.emptyFolders) pack.emptyFolders.forEach(add);
			    return [...set].sort(cmpPath);
			}

			function parentDirOf(path) {
			    const i = path.lastIndexOf('/');
			    return i === -1 ? '' : path.substring(0, i);
			}

			function promptMoveItem(kind, path) {
			    const pack = packsData[currentTab];
			    if (!pack) return;
			    if (kind === 'file' && path === 'manifest.json') {
			        alert(t('manifest.json はルートから移動できません。'));
			        return;
			    }
			    moveTarget = { type: kind, path };
			    moveDest = null;
			    document.getElementById('moveSourcePath').textContent = path + (kind === 'folder' ? '/' : '');
			    document.getElementById('moveErrorAlert').classList.add('hidden');
			    renderMoveDestList();
			    document.getElementById('moveModal').classList.remove('hidden');
			}

			function renderMoveDestList() {
			    const pack = packsData[currentTab];
			    const box = document.getElementById('moveDestList');
			    box.innerHTML = '';
			    if (!pack || !moveTarget) return;
			    const cur = parentDirOf(moveTarget.path);
			    const entries = [{ path: '', depth: 0, label: '(ルート)' }];
			    collectAllFolders(pack).forEach(fp => {
			        entries.push({ path: fp, depth: fp.split('/').length, label: fp.split('/').pop() });
			    });
			    entries.forEach(en => {
			        const invalid = moveTarget.type === 'folder' &&
			            (en.path === moveTarget.path || en.path.startsWith(moveTarget.path + '/'));
			        const isCurrent = en.path === cur; // すでにそこにある
			        const b = document.createElement('button');
			        b.type = 'button';
			        b.className = 'move-dest-item' + (moveDest === en.path ? ' selected' : '');
			        b.style.paddingLeft = (8 + en.depth * 14) + 'px';
			        b.disabled = invalid || isCurrent;
			        b.innerHTML = `<i data-lucide="${en.path === '' ? 'folder-tree' : 'folder'}" class="w-3.5 h-3.5 shrink-0 text-amber-400"></i><span class="truncate"></span>`;
			        b.lastChild.textContent = en.label;
			        b.addEventListener('click', () => {
			            moveDest = en.path;
			            document.getElementById('moveErrorAlert').classList.add('hidden');
			            renderMoveDestList();
			        });
			        box.appendChild(b);
			    });
			    lucide.createIcons();
			}

			function closeMoveModal() {
			    document.getElementById('moveModal').classList.add('hidden');
			    moveTarget = null;
			    moveDest = null;
			}

			function showMoveError(msg) {
			    document.getElementById('moveErrorText').textContent = msg;
			    document.getElementById('moveErrorAlert').classList.remove('hidden');
			}

			// 移動元が空になった場合でもフォルダ自体は残す(エクスプローラーと同じ挙動)
			function keepFolderIfEmpty(pack, dir) {
			    if (!dir) return;
			    const has = pack.files.some(f => f.path.startsWith(dir + '/')) ||
			        [...pack.emptyFolders].some(fp => fp.startsWith(dir + '/'));
			    if (!has) pack.emptyFolders.add(dir);
			}

			function confirmMoveItem() {
			    if (!moveTarget) return;
			    const pack = packsData[currentTab];
			    if (!pack) return;
			    if (!pack.emptyFolders) pack.emptyFolders = new Set();
			    if (moveDest === null) { showMoveError('移動先のフォルダを選択してください。'); return; }

			    const rootPrefix = pack.rootPrefix === '/' ? '' : pack.rootPrefix;
			    const oldPath = moveTarget.path;
			    const name = oldPath.split('/').pop();
			    const newPath = moveDest ? `${moveDest}/${name}` : name;
			    const oldParent = parentDirOf(oldPath);

			    if (newPath === oldPath) { showMoveError('すでにそのフォルダにあります。'); return; }

			    if (moveTarget.type === 'file') {
			        if (pack.files.some(f => f.path === newPath)) { showMoveError('移動先に同名のファイルが既に存在します。'); return; }
			        if (pack.files.some(f => f.path.startsWith(newPath + '/')) || pack.emptyFolders.has(newPath)) {
			            showMoveError('移動先に同名のフォルダが既に存在します。'); return;
			        }
			        const fileObj = pack.files.find(f => f.path === oldPath);
			        if (!fileObj) { closeMoveModal(); return; }
			        fileObj.path = newPath;
			        fileObj.fullZipPath = rootPrefix + newPath;
			        if (activeFile === fileObj) editorFilePath.textContent = newPath;
			        if (selectedFilePath === oldPath) selectedFilePath = newPath;
			    } else {
			        if (moveDest === oldPath || moveDest.startsWith(oldPath + '/')) {
			            showMoveError('フォルダを自分自身の中には移動できません。'); return;
			        }
			        if (pack.files.some(f => f.path === newPath)) { showMoveError('移動先に同名のファイルが既に存在します。'); return; }
			        if (pack.files.some(f => f.path.startsWith(newPath + '/')) || pack.emptyFolders.has(newPath)) {
			            showMoveError('移動先に同名のフォルダが既に存在します。'); return;
			        }
			        const remap = (fp) => fp === oldPath ? newPath
			            : (fp.startsWith(oldPath + '/') ? newPath + fp.substring(oldPath.length) : fp);

			        pack.files.forEach(f => {
			            if (f.path.startsWith(oldPath + '/')) {
			                f.path = remap(f.path);
			                f.fullZipPath = rootPrefix + f.path;
			            }
			        });
			        pack.emptyFolders = new Set([...pack.emptyFolders].map(remap));
			        openFoldersSet = new Set([...openFoldersSet].map(remap));
			        if (selectedFolderPath) selectedFolderPath = remap(selectedFolderPath);
			        if (selectedFilePath) selectedFilePath = remap(selectedFilePath);
			        if (activeFile && activeFile.path) editorFilePath.textContent = activeFile.path;
			    }

			    if (moveDest) { pack.emptyFolders.delete(moveDest); openFoldersSet.add(moveDest); }
			    keepFolderIfEmpty(pack, oldParent);

			    closeMoveModal();
			    renderCurrentPackTree();
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
			        alert(t("出力エラーが発生しました: ") + t(err.message));
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
			    jpegQuality: 92, zoom: 8, showGrid: true,
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
			        } else if (imgEd.dirty) {
			            imgEdScheduleAutoApply(); // 適用中に追加の編集があった
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
			        alert(t('画像の保存に失敗しました: ') + t(err.message));
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
			    document.getElementById('imgEdColorHex').value = imgEd.color.replace('#', '').toUpperCase();
			    document.getElementById('imgEdOpacity').value = imgEd.opacity;
			    document.getElementById('imgEdOpacityVal').textContent = imgEd.opacity + '%';
			    document.getElementById('imgEdSizeVal').value = imgEd.size;
			    document.getElementById('imgEdTolerance').value = imgEd.tolerance;
			    document.getElementById('imgEdToleranceVal').textContent = imgEd.tolerance;
			    document.getElementById('imgEdJpegQuality').value = imgEd.jpegQuality;
			    document.getElementById('imgEdJpegQualityVal').textContent = imgEd.jpegQuality + '%';

			    imgEdCanvas.style.cursor = imgEd.tool === 'hand' ? 'grab' : 'crosshair';
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
			    document.getElementById('imgEdColorHex').value = hex.replace('#', '').toUpperCase();
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
			    imgEdScheduleAutoApply();
			}
			// 画像の編集内容は変更のたびに自動でファイルへ反映する(描画中は終わるまで待つ)
			let imgAutoApplyTimer = null;
			function imgEdScheduleAutoApply() {
			    clearTimeout(imgAutoApplyTimer);
			    imgAutoApplyTimer = setTimeout(imgEdAutoApplyTick, 300);
			}
			function imgEdAutoApplyTick() {
			    if (!imgEd.dirty || !imgEd.file || !imgEd.img) return;
			    if (imgEd.stroke) { imgEdScheduleAutoApply(); return; }
			    applyImageEditorChanges();
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
			                        imgEdBlendPixel(d, (y * W + x) * 4, cr, cg, cb, alpha);
			                    }
			                }
			            }
			        } else {
			            const cx = (x0 + x1 + 1) / 2, cy = (y0 + y1 + 1) / 2;
			            const rx = (x1 - x0 + 1) / 2, ry = (y1 - y0 + 1) / 2;
			            const irx = rx - s, iry = ry - s;
			            for (let y = sy; y <= ey; y++) {
			                for (let x = sx; x <= ex; x++) {
			                    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
			                    if (dx * dx + dy * dy > 1) continue;
			                    if (!fill && irx > 0 && iry > 0) {
			                        const ux = (x + 0.5 - cx) / irx, uy = (y + 0.5 - cy) / iry;
			                        if (ux * ux + uy * uy < 1) continue;
			                    }
			                    imgEdBlendPixel(d, (y * W + x) * 4, cr, cg, cb, alpha);
			                }
			            }
			        }
			    }
			    imgEdCtx.putImageData(img, 0, 0);
			}

			function imgEdFlood(sx, sy) {
			    const img = imgEd.img, W = img.width, H = img.height, d = img.data;
			    const t0 = (sy * W + sx) * 4;
			    const tr = d[t0], tg = d[t0 + 1], tb = d[t0 + 2], ta = d[t0 + 3];
			    const [fr, fg, fb] = imgEdRgb();
			    const fa = Math.round(imgEd.opacity / 100 * 255);
			    const tol = imgEd.tolerance;
			    if (tol === 0 && tr === fr && tg === fg && tb === fb && ta === fa) return;

			    const match = (i) => {
			        const a = d[i + 3];
			        if (ta === 0 && a === 0) return true;
			        return Math.abs(d[i] - tr) <= tol && Math.abs(d[i + 1] - tg) <= tol &&
			               Math.abs(d[i + 2] - tb) <= tol && Math.abs(a - ta) <= tol;
			    };
			    const visited = new Uint8Array(W * H);
			    const stack = [sx, sy];
			    while (stack.length) {
			        const cy = stack.pop(), cx = stack.pop();
			        let lx = cx;
			        while (lx >= 0 && !visited[cy * W + lx] && match((cy * W + lx) * 4)) lx--;
			        lx++;
			        let up = false, down = false;
			        for (let x = lx; x < W; x++) {
			            const pi = cy * W + x;
			            if (visited[pi] || !match(pi * 4)) break;
			            visited[pi] = 1;
			            const i = pi * 4;
			            d[i] = fr; d[i + 1] = fg; d[i + 2] = fb; d[i + 3] = fa;
			            if (cy > 0) {
			                const j = (cy - 1) * W + x;
			                const m = !visited[j] && match(j * 4);
			                if (m && !up) { stack.push(x, cy - 1); up = true; } else if (!m) up = false;
			            }
			            if (cy < H - 1) {
			                const j = (cy + 1) * W + x;
			                const m = !visited[j] && match(j * 4);
			                if (m && !down) { stack.push(x, cy + 1); down = true; } else if (!m) down = false;
			            }
			        }
			    }
			}

			function imgEdPickColor(x, y) {
			    const d = imgEd.img.data, i = (y * imgEd.img.width + x) * 4;
			    if (d[i + 3] === 0) return; // 透明ピクセルは取得しない
			    const hex = '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
			    imgEdSetColor(hex);
			    imgEd.opacity = Math.max(1, Math.round(d[i + 3] / 255 * 100));
			    if (imgEd.prevTool && imgEd.prevTool !== 'eraser') imgEd.tool = imgEd.prevTool;
			    imgEdSyncUi();
			}

			/* ---------- ポインター操作 ---------- */
			function imgEdPos(e) {
			    const r = imgEdCanvas.getBoundingClientRect();
			    return {
			        x: Math.floor((e.clientX - r.left) / r.width * imgEd.img.width),
			        y: Math.floor((e.clientY - r.top) / r.height * imgEd.img.height)
			    };
			}

			function imgEdUpdateHover(e) {
			    const p = imgEdPos(e), W = imgEd.img.width, H = imgEd.img.height;
			    const inside = p.x >= 0 && p.y >= 0 && p.x < W && p.y < H;
			    document.getElementById('imgEdPosText').textContent = inside ? `X ${p.x}  Y ${p.y}` : 'X -  Y -';
			    if (e.pointerType === 'touch' || !inside || imgEd.tool === 'hand') { imgEdCursor.style.display = 'none'; return; }
			    const brushTool = ['pen', 'eraser', 'line'].includes(imgEd.tool);
			    const b = brushTool ? imgEd.size : 1;
			    const z = imgEd.zoom, half = Math.floor(b / 2);
			    imgEdCursor.style.display = 'block';
			    imgEdCursor.style.left = ((p.x - half) * z) + 'px';
			    imgEdCursor.style.top = ((p.y - half) * z) + 'px';
			    imgEdCursor.style.width = (b * z) + 'px';
			    imgEdCursor.style.height = (b * z) + 'px';
			    imgEdCursor.style.borderRadius = (brushTool && imgEd.shape === 'round' && b >= 4) ? '50%' : '0';
			}

			function imgEdPointerDown(e) {
			    if (!imgEd.img || !e.isPrimary || imgEd.stroke || imgEd.pan) return;
			    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
			    e.preventDefault();
			    const tool = (e.pointerType === 'mouse' && e.button === 1) ? 'hand' : imgEd.tool;

			    if (tool === 'hand') {
			        imgEd.pan = { id: e.pointerId, x: e.clientX, y: e.clientY, sl: imgEdViewport.scrollLeft, st: imgEdViewport.scrollTop };
			        imgEdCanvas.setPointerCapture(e.pointerId);
			        imgEdCanvas.style.cursor = 'grabbing';
			        return;
			    }

			    const p = imgEdPos(e), W = imgEd.img.width, H = imgEd.img.height;
			    if (p.x < 0 || p.y < 0 || p.x >= W || p.y >= H) return;

			    if (tool === 'picker') { imgEdPickColor(p.x, p.y); return; }

			    if (tool === 'fill') {
			        imgEdPushHistory();
			        imgEdFlood(p.x, p.y);
			        imgEdRender();
			        return;
			    }

			    const base = imgEdPushHistory();
			    imgEd.stroke = { id: e.pointerId, tool, start: p, last: p, base, mask: new Uint8Array(W * H), dirty: null };
			    imgEdCanvas.setPointerCapture(e.pointerId);

			    if (tool === 'pen' || tool === 'eraser') {
			        imgEdStamp(p.x, p.y);
			        imgEdFlush();
			    } else {
			        imgEdDrawShape(e.shiftKey);
			    }
			}

			function imgEdPointerMove(e) {
			    if (!imgEd.img) return;
			    imgEdUpdateHover(e);

			    const pan = imgEd.pan;
			    if (pan && e.pointerId === pan.id) {
			        imgEdViewport.scrollLeft = pan.sl - (e.clientX - pan.x);
			        imgEdViewport.scrollTop = pan.st - (e.clientY - pan.y);
			        return;
			    }

			    const st = imgEd.stroke;
			    if (!st || e.pointerId !== st.id) return;
			    const p = imgEdPos(e);
			    if (st.tool === 'pen' || st.tool === 'eraser') {
			        if (p.x === st.last.x && p.y === st.last.y) return;
			        imgEdLinePoints(st.last.x, st.last.y, p.x, p.y, (x, y) => imgEdStamp(x, y));
			        st.last = p;
			        imgEdFlush();
			    } else {
			        st.last = p;
			        imgEdDrawShape(e.shiftKey);
			    }
			}

			function imgEdPointerUp(e) {
			    if (imgEd.pan && e.pointerId === imgEd.pan.id) {
			        imgEd.pan = null;
			        imgEdCanvas.style.cursor = imgEd.tool === 'hand' ? 'grab' : 'crosshair';
			        return;
			    }
			    const st = imgEd.stroke;
			    if (!st || e.pointerId !== st.id) return;
			    imgEdFlush();
			    imgEd.stroke = null;
			    imgEdMarkDirty(); // 描画完了時点の内容を自動適用の対象にする
			}

			imgEdCanvas.addEventListener('pointerdown', imgEdPointerDown);
			imgEdCanvas.addEventListener('pointermove', imgEdPointerMove);
			imgEdCanvas.addEventListener('pointerup', imgEdPointerUp);
			imgEdCanvas.addEventListener('pointercancel', imgEdPointerUp);
			imgEdCanvas.addEventListener('lostpointercapture', imgEdPointerUp);
			imgEdCanvas.addEventListener('pointerleave', () => { if (!imgEd.stroke) imgEdCursor.style.display = 'none'; });
			imgEdCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
			imgEdViewport.addEventListener('wheel', (e) => {
			    if (!imgEd.img || !(e.ctrlKey || e.metaKey)) return;
			    e.preventDefault();
			    imgEdZoomStep(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY);
			}, { passive: false });

			/* ---------- オプション入力 ---------- */
			document.getElementById('imgEdColor').addEventListener('input', (e) => {
			    imgEd.color = e.target.value;
			    document.getElementById('imgEdColorHex').value = imgEd.color.replace('#', '').toUpperCase();
			});
			document.getElementById('imgEdColorHex').addEventListener('input', (e) => {
			    // 3桁または6桁のHEXのみ受け付ける(入力途中は反映しない)
			    const v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
			    e.target.value = v;
			    if (v.length === 3 || v.length === 6) {
			        const hex = '#' + v;
			        imgEd.color = hex;
			        document.getElementById('imgEdColor').value = v.length === 3
			            ? '#' + [...v].map(c => c + c).join('')
			            : hex;
			    }
			});
			document.getElementById('imgEdColorHex').addEventListener('blur', (e) => {
			    // フォーカスを外した際に不正な値なら現在の色に戻す
			    e.target.value = imgEd.color.replace('#', '').toUpperCase();
			});
			document.getElementById('imgEdOpacity').addEventListener('input', (e) => {
			    imgEd.opacity = parseInt(e.target.value, 10);
			    document.getElementById('imgEdOpacityVal').textContent = imgEd.opacity + '%';
			});
			document.getElementById('imgEdSizeVal').addEventListener('input', (e) => {
			    const n = parseInt(e.target.value, 10);
			    if (!(n >= 1)) return;
			    imgEd.size = Math.min(999, Math.max(1, n));
			});
			document.getElementById('imgEdSizeVal').addEventListener('blur', (e) => {
			    // フォーカスを外した際に範囲外/不正な値を補正する
			    e.target.value = imgEd.size;
			});
			document.getElementById('imgEdTolerance').addEventListener('input', (e) => {
			    imgEd.tolerance = parseInt(e.target.value, 10);
			    document.getElementById('imgEdToleranceVal').textContent = imgEd.tolerance;
			});
			document.getElementById('imgEdJpegQuality').addEventListener('input', (e) => {
			    imgEd.jpegQuality = parseInt(e.target.value, 10);
			    document.getElementById('imgEdJpegQualityVal').textContent = imgEd.jpegQuality + '%';
			    if (imgEd.img) imgEdMarkDirty(); // 画質変更も適用対象にする
			});

			/* ---------- 変形操作 ---------- */
			function imgEdFlip(dir) {
			    if (!imgEd.img || imgEd.stroke) return;
			    const { width: W, height: H } = imgEd.img;
			    const out = new ImageData(W, H);
			    const src = new Uint32Array(imgEd.img.data.buffer), dst = new Uint32Array(out.data.buffer);
			    for (let y = 0; y < H; y++) {
			        for (let x = 0; x < W; x++) {
			            const sx = dir === 'h' ? W - 1 - x : x;
			            const sy = dir === 'v' ? H - 1 - y : y;
			            dst[y * W + x] = src[sy * W + sx];
			        }
			    }
			    imgEdReplaceImage(out);
			}

			function imgEdRotate(dir) { // 1: 右(時計回り) / -1: 左
			    if (!imgEd.img || imgEd.stroke) return;
			    const { width: W, height: H } = imgEd.img;
			    const out = new ImageData(H, W);
			    const src = new Uint32Array(imgEd.img.data.buffer), dst = new Uint32Array(out.data.buffer);
			    for (let y = 0; y < H; y++) {
			        for (let x = 0; x < W; x++) {
			            const nx = dir === 1 ? H - 1 - y : y;
			            const ny = dir === 1 ? x : W - 1 - x;
			            dst[ny * H + nx] = src[y * W + x];
			        }
			    }
			    imgEdReplaceImage(out);
			    imgEdFitZoom();
			}

			function imgEdClearAll() {
			    if (!imgEd.img || imgEd.stroke) return;
			    imgEdPushHistory();
			    imgEd.img.data.fill(0);
			    imgEdRender();
			}

			/* ---------- サイズ変更 ---------- */
			function imgEdOpenResize() {
			    if (!imgEd.img || imgEd.stroke) return;
			    imgEd.resizeMode = 'scale';
			    imgEd.anchor = [1, 1];
			    imgEd.lockAspect = true;
			    document.getElementById('imgEdResizeW').value = imgEd.img.width;
			    document.getElementById('imgEdResizeH').value = imgEd.img.height;
			    document.getElementById('imgEdResizeCur').textContent = `${imgEd.img.width} × ${imgEd.img.height} px`;
			    document.getElementById('imgEdResizeErr').classList.add('hidden');
			    imgEdResizeUi();
			    document.getElementById('imgEdResizeModal').classList.remove('hidden');
			}
			function imgEdCloseResize() {
			    document.getElementById('imgEdResizeModal').classList.add('hidden');
			}
			function imgEdResizeUi() {
			    const modal = document.getElementById('imgEdResizeModal');
			    modal.querySelectorAll('[data-rmode]').forEach(b => b.classList.toggle('active', b.dataset.rmode === imgEd.resizeMode));
			    modal.querySelectorAll('[data-rpanel]').forEach(p => p.classList.toggle('hidden', p.dataset.rpanel !== imgEd.resizeMode));
			    modal.querySelectorAll('[data-anchor]').forEach(b => b.classList.toggle('active', b.dataset.anchor === imgEd.anchor.join(',')));
			    document.getElementById('imgEdLockBtn').classList.toggle('active', imgEd.lockAspect);
			    imgEdResizeCheck();
			}
			function imgEdResizeMode(m) {
			    imgEd.resizeMode = m;
			    imgEd.lockAspect = (m === 'scale');
			    imgEdResizeUi();
			}
			function imgEdToggleLock() {
			    imgEd.lockAspect = !imgEd.lockAspect;
			    imgEdResizeUi();
			}
			function imgEdSetAnchor(ax, ay) {
			    imgEd.anchor = [ax, ay];
			    imgEdResizeUi();
			}
			function imgEdResizeInput(which) {
			    if (imgEd.lockAspect && imgEd.img) {
			        const wEl = document.getElementById('imgEdResizeW'), hEl = document.getElementById('imgEdResizeH');
			        const ratio = imgEd.img.height / imgEd.img.width;
			        if (which === 'w') {
			            const w = parseInt(wEl.value, 10);
			            if (w > 0) hEl.value = Math.max(1, Math.round(w * ratio));
			        } else {
			            const h = parseInt(hEl.value, 10);
			            if (h > 0) wEl.value = Math.max(1, Math.round(h / ratio));
			        }
			    }
			    imgEdResizeCheck();
			}
			function imgEdResizePreset(n) {
			    document.getElementById('imgEdResizeW').value = n;
			    if (imgEd.lockAspect) imgEdResizeInput('w');
			    else document.getElementById('imgEdResizeH').value = n;
			    imgEdResizeCheck();
			}
			function imgEdResizeCheck() {
			    const w = parseInt(document.getElementById('imgEdResizeW').value, 10);
			    const h = parseInt(document.getElementById('imgEdResizeH').value, 10);
			    const warn = document.getElementById('imgEdResizeWarn');
			    const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
			    if (w > 0 && h > 0 && (!isPow2(w) || !isPow2(h))) {
			        warn.textContent = '幅・高さが2の累乗(16, 32, 64, 128…)ではありません。テクスチャによっては表示が乱れる場合があります。';
			        warn.classList.remove('hidden');
			    } else {
			        warn.classList.add('hidden');
			    }
			}

			function imgEdScaleImage(img, nw, nh, smooth) {
			    const src = document.createElement('canvas');
			    src.width = img.width; src.height = img.height;
			    src.getContext('2d').putImageData(img, 0, 0);
			    const dst = document.createElement('canvas');
			    dst.width = nw; dst.height = nh;
			    const cx = dst.getContext('2d', { willReadFrequently: true });
			    cx.imageSmoothingEnabled = smooth;
			    if (smooth) cx.imageSmoothingQuality = 'high';
			    cx.drawImage(src, 0, 0, nw, nh);
			    return cx.getImageData(0, 0, nw, nh);
			}

			function imgEdResizeCanvasImage(img, nw, nh, anchor) {
			    const ow = img.width, oh = img.height;
			    const ox = anchor[0] === 0 ? 0 : (anchor[0] === 1 ? Math.floor((nw - ow) / 2) : nw - ow);
			    const oy = anchor[1] === 0 ? 0 : (anchor[1] === 1 ? Math.floor((nh - oh) / 2) : nh - oh);
			    const out = new ImageData(nw, nh);
			    const sx0 = Math.max(0, -ox), sx1 = Math.min(ow, nw - ox);
			    if (sx1 > sx0) {
			        for (let y = 0; y < nh; y++) {
			            const sy = y - oy;
			            if (sy < 0 || sy >= oh) continue;
			            out.data.set(img.data.subarray((sy * ow + sx0) * 4, (sy * ow + sx1) * 4), (y * nw + sx0 + ox) * 4);
			        }
			    }
			    return out;
			}

			function imgEdApplyResize() {
			    const err = document.getElementById('imgEdResizeErr');
			    const nw = parseInt(document.getElementById('imgEdResizeW').value, 10);
			    const nh = parseInt(document.getElementById('imgEdResizeH').value, 10);
			    if (!(nw >= 1 && nh >= 1) || nw > IMG_ED_MAX_SIZE || nh > IMG_ED_MAX_SIZE) {
			        err.textContent = `幅と高さは 1〜${IMG_ED_MAX_SIZE} の整数で入力してください。`;
			        err.classList.remove('hidden');
			        return;
			    }
			    if (nw === imgEd.img.width && nh === imgEd.img.height) { imgEdCloseResize(); return; }
			    let out;
			    if (imgEd.resizeMode === 'scale') {
			        const smooth = document.getElementById('imgEdResizeSmooth').value === 'smooth';
			        out = imgEdScaleImage(imgEd.img, nw, nh, smooth);
			    } else {
			        out = imgEdResizeCanvasImage(imgEd.img, nw, nh, imgEd.anchor);
			    }
			    imgEdReplaceImage(out);
			    imgEdCloseResize();
			    imgEdFitZoom();
			}

			/* ---------- キーボードショートカット ---------- */
			document.addEventListener('keydown', (e) => {
			    if (!imgEd.img || imageEditorArea.classList.contains('hidden') || imageEditorArea.offsetParent === null) return;
			    if (document.querySelector('[id$="Modal"]:not(.hidden)')) return;
			    const t = e.target, tag = t && t.tagName;
			    if (tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && t.type !== 'range' && t.type !== 'color')) return;

			    const mod = e.ctrlKey || e.metaKey;
			    const k = e.key.toLowerCase();
			    if (mod && k === 'z') { e.preventDefault(); if (e.shiftKey) imgEdRedo(); else imgEdUndo(); return; }
			    if (mod && k === 'y') { e.preventDefault(); imgEdRedo(); return; }
			    if (mod && k === 's') { e.preventDefault(); applyImageEditorChanges(); return; }
			    if (mod || e.altKey) return;

			    const map = { h: 'hand', b: 'pen', e: 'eraser', g: 'fill', i: 'picker', l: 'line', r: 'rect', o: 'ellipse' };
			    if (map[k]) { imgEdSetTool(map[k]); return; }
			    if (k === '+' || k === '=') imgEdZoomStep(1);
			    else if (k === '-') imgEdZoomStep(-1);
			});

			// パック読み込み・新規作成・ホームへ戻る際に画像エディタの状態を破棄する
			function resetImageEditorState() {
			    imgEd.file = null;
			    imgEd.img = null;
			    imgEd.history = [];
			    imgEd.future = [];
			    imgEd.dirty = false;
			    imgEd.stroke = null;
			    imgEd.pan = null;
			    if (!imageEditorArea.classList.contains('hidden')) {
			        imageEditorArea.classList.add('hidden');
			        editorPlaceholder.classList.remove('hidden');
			        editorControls.classList.add('hidden');
			        editorFilePath.textContent = "ファイルを選択してください";
			    }
			}


			/* =====================================================================
			   プロジェクトの自動保存 / 一覧 (IndexedDB)
			   - 作成・読み込みしたパックは「プロジェクト」として端末内に自動保存される
			   - 初期画面の一覧から、保存済みのプロジェクトを再び開ける
			   - ファイル本体は projects とは別のストアにファイル単位で保存し、変更分だけ書き込む
			   ===================================================================== */
			const PROJECT_DB_NAME = 'addonforge.projects';
			const PROJECT_DB_VERSION = 1;
			let projectDbPromise = null;
			let projectDbOk = true;

			let currentProjectId = null;
			let projectCreatedAt = 0;
			let projectSavedKeys = new Set();        // DBに保存済みのファイルキー
			let projectSavedState = new WeakMap();   // file → { path, ref } (最後に保存した時点の状態)
			let projectLastMeta = null;              // 最後に保存したメタ情報(JSON文字列)
			let projectIcons = { bp: null, rp: null };
			let projectSaving = false;
			let projectSavePending = false;
			let projectSaveTimer = null;
			let projectIconUrls = [];
			let projectDeleteTargetId = null;
			let projectRenameTargetId = null;
			let projectName = null;                    // 利用者が付けた名前(未設定ならパック名などから自動決定)
			let projectType = 'addon';                // プロジェクトの種類
			let projectFileSizes = new Map();         // ファイルキー → バイト数

			// プロジェクトの種類。今はアドオンのみ。種類を増やすときはここに追加する
			const PROJECT_TYPES = {
			    addon: { label: 'アドオン', icon: 'package' },
			    texture: { label: 'テクスチャ', icon: 'image' }
			};
			const DEFAULT_PROJECT_TYPE = 'addon';
			const PROJECT_NAME_MAX = 100;

			function openProjectDb() {
			    if (projectDbPromise) return projectDbPromise;
			    projectDbPromise = new Promise((resolve, reject) => {
			        if (!window.indexedDB) { reject(new Error('IndexedDB is not available')); return; }
			        const req = indexedDB.open(PROJECT_DB_NAME, PROJECT_DB_VERSION);
			        req.onupgradeneeded = () => {
			            const db = req.result;
			            if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
			            if (!db.objectStoreNames.contains('files')) db.createObjectStore('files', { keyPath: 'k' });
			        };
			        req.onsuccess = () => resolve(req.result);
			        req.onerror = () => reject(req.error || new Error('Failed to open the database'));
			    });
			    projectDbPromise.catch(() => { projectDbOk = false; });
			    return projectDbPromise;
			}

			function idbRequest(req) {
			    return new Promise((resolve, reject) => {
			        req.onsuccess = () => resolve(req.result);
			        req.onerror = () => reject(req.error);
			    });
			}

			function idbTransactionDone(tx) {
			    return new Promise((resolve, reject) => {
			        tx.oncomplete = () => resolve();
			        tx.onerror = () => reject(tx.error);
			        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
			    });
			}

			// zipObj と同じ async(type) を持つ、保存済みバイト列用の代用オブジェクト
			function makeStoredZipObj(bytes) {
			    return {
			        dir: false,
			        async(type) {
			            if (type === 'string') return Promise.resolve(new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes));
			            if (type === 'blob') return Promise.resolve(new Blob([bytes]));
			            if (type === 'arraybuffer') return Promise.resolve(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
			            return Promise.resolve(bytes);
			        }
			    };
			}

			function toBytes(data) {
			    if (data instanceof Uint8Array) return data;
			    if (typeof data === 'string') return new TextEncoder().encode(data);
			    if (data instanceof ArrayBuffer) return new Uint8Array(data);
			    return new Uint8Array(data);
			}

			function getProjectDisplayName() {
			    if (projectName) return projectName;
			    const hn = (p) => p && p.manifest && p.manifest.header && p.manifest.header.name;
			    return importedArchiveName || hn(packsData.bp) || hn(packsData.rp) || 'Untitled';
			}

			function buildProjectMeta() {
			    const meta = {};
			    let fileCount = 0;
			    for (const type of ['bp', 'rp']) {
			        const pack = packsData[type];
			        if (!pack) continue;
			        meta[type] = {
			            rootPrefix: pack.rootPrefix,
			            folderName: pack.folderName,
			            manifest: pack.manifest,
			            emptyFolders: Array.from(pack.emptyFolders || [])
			        };
			        pack.files.forEach(f => { if (!f.path.endsWith('/.keep')) fileCount++; });
			    }
			    const name = getProjectDisplayName();
			    return { meta: meta, fileCount: fileCount, name: name, str: JSON.stringify({ name: name, custom: !!projectName, type: projectType, meta: meta, fileCount: fileCount }) };
			}

			function byteLengthOf(data) {
			    if (typeof data === 'string') return new TextEncoder().encode(data).length;
			    if (data && typeof data.byteLength === 'number') return data.byteLength;
			    return 0;
			}

			function formatBytes(n) {
			    n = Number(n) || 0;
			    if (n < 1024) return n + ' B';
			    const units = ['KB', 'MB', 'GB'];
			    let v = n / 1024, i = 0;
			    while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
			    return (v >= 100 ? v.toFixed(0) : v.toFixed(1)) + ' ' + units[i];
			}

			function isPackIconPath(path) {
			    return String(path).toLowerCase() === 'pack_icon.png';
			}

			// 新しいプロジェクトとして保存を開始する(新規作成・ファイル読み込み時)
			function beginNewProject() {
			    currentProjectId = generateUuid();
			    projectCreatedAt = Date.now();
			    projectSavedKeys = new Set();
			    projectSavedState = new WeakMap();
			    projectLastMeta = null;
			    projectIcons = { bp: null, rp: null };
			    projectName = null;
			    projectType = DEFAULT_PROJECT_TYPE;
			    projectFileSizes = new Map();
			    scheduleProjectSave(0);
			}

			function scheduleProjectSave(delay = 1200) {
			    if (!currentProjectId || !projectDbOk) return;
			    clearTimeout(projectSaveTimer);
			    projectSaveTimer = setTimeout(() => { saveCurrentProject(); }, delay);
			}

			async function saveCurrentProject() {
			    if (!currentProjectId || !projectDbOk) return;
			    if (projectSaving) { projectSavePending = true; return; }
			    projectSaving = true;
			    clearTimeout(projectSaveTimer);
			    try {
			        const pid = currentProjectId;
			        await commitImageEditorIfDirty(); // 画像エディタの未適用変更を先に反映
			        if (pid !== currentProjectId) return;

			        const puts = [];
			        const currentKeys = new Set();
			        const newIcons = { bp: projectIcons.bp, rp: projectIcons.rp };
			        const newSizes = new Map();

			        for (const type of ['bp', 'rp']) {
			            const pack = packsData[type];
			            if (!pack) { newIcons[type] = null; continue; }
			            let hasIcon = false;
			            for (const f of pack.files) {
			                const key = `${pid}|${type}|${f.path}`;
			                currentKeys.add(key);
			                const isIcon = isPackIconPath(f.path);
			                if (isIcon) hasIcon = true;

			                const mc = f.modifiedContent;
			                const ref = (mc !== null && mc !== undefined) ? mc : f.zipObj;
			                const prev = projectSavedState.get(f);
			                if (projectSavedKeys.has(key) && prev && prev.path === f.path && prev.ref === ref) {
			                    newSizes.set(key, projectFileSizes.get(key) || 0);
			                    continue;
			                }

			                let data;
			                if (mc !== null && mc !== undefined) data = mc;
			                else if (f.zipObj) data = await f.zipObj.async('uint8array');
			                else { newSizes.set(key, 0); continue; }
			                newSizes.set(key, byteLengthOf(data));
			                puts.push({ rec: { k: key, pid: pid, pack: type, path: f.path, fullZipPath: f.fullZipPath, data: data }, f: f, ref: ref });
			                if (isIcon) newIcons[type] = toBytes(data);
			            }
			            if (!hasIcon) newIcons[type] = null;
			        }
			        if (pid !== currentProjectId) return;

			        const snap = buildProjectMeta();
			        const name = snap.name, meta = snap.meta, fileCount = snap.fileCount, metaStr = snap.str;
			        const removed = [];
			        projectSavedKeys.forEach(k => { if (!currentKeys.has(k)) removed.push(k); });
			        if (!puts.length && !removed.length && metaStr === projectLastMeta) return; // 変更なし

			        const record = {
			            id: pid,
			            name: name,
			            createdAt: projectCreatedAt,
			            updatedAt: Date.now(),
			            importedArchiveName: importedArchiveName,
			            packs: meta,
			            fileCount: fileCount,
			            totalBytes: Array.from(newSizes.values()).reduce((a, b) => a + b, 0),
			            type: projectType,
			            nameCustom: !!projectName,
			            icon: newIcons.bp || newIcons.rp || null
			        };

			        const db = await openProjectDb();
			        const tx = db.transaction(['projects', 'files'], 'readwrite');
			        const done = idbTransactionDone(tx);
			        const fileStore = tx.objectStore('files');
			        puts.forEach(p => fileStore.put(p.rec));
			        removed.forEach(k => fileStore.delete(k));
			        tx.objectStore('projects').put(record);
			        await done;

			        puts.forEach(p => projectSavedState.set(p.f, { path: p.f.path, ref: p.ref }));
			        projectSavedKeys = currentKeys;
			        projectFileSizes = newSizes;
			        projectLastMeta = metaStr;
			        projectIcons = newIcons;

			        if (navigator.storage && navigator.storage.persist) { navigator.storage.persist().catch(() => {}); }
			    } catch (err) {
			        console.error('プロジェクトの保存に失敗しました', err);
			    } finally {
			        projectSaving = false;
			        if (projectSavePending) { projectSavePending = false; scheduleProjectSave(300); }
			    }
			}

			// 保存を今すぐ完了させる(ホームへ戻る前など)
			async function flushProjectSave() {
			    clearTimeout(projectSaveTimer);
			    if (!currentProjectId) return;
			    for (let i = 0; i < 20 && projectSaving; i++) await new Promise(r => setTimeout(r, 50));
			    await saveCurrentProject();
			}

			async function openProject(id) {
			    showLoading(true, "プロジェクトを読み込み中...", "保存されたパックを復元しています");
			    try {
			        const db = await openProjectDb();
			        const rec = await idbRequest(db.transaction('projects').objectStore('projects').get(id));
			        if (!rec) throw new Error('プロジェクトが見つかりません');
			        const files = await idbRequest(
			            db.transaction('files').objectStore('files').getAll(IDBKeyRange.bound(id + '|', id + '|\uffff'))
			        );

			        stopAudioPlayback();
			        const restored = { bp: null, rp: null };
			        const savedKeys = new Set();
			        const savedState = new WeakMap();
			        const icons = { bp: null, rp: null };
			        const sizes = new Map();

			        for (const type of ['bp', 'rp']) {
			            const m = rec.packs && rec.packs[type];
			            if (!m) continue;
			            const pack = {
			                rootPrefix: m.rootPrefix,
			                folderName: m.folderName,
			                manifest: m.manifest,
			                files: [],
			                emptyFolders: new Set(m.emptyFolders || []),
			                iconBlob: null,
			                iconUrl: null
			            };
			            files.filter(r => r.pack === type).forEach(r => {
			                const f = { path: r.path, fullZipPath: r.fullZipPath, zipObj: null, modifiedContent: null };
			                if (typeof r.data === 'string') {
			                    f.zipObj = makeStoredZipObj(new TextEncoder().encode(r.data));
			                } else {
			                    f.zipObj = makeStoredZipObj(toBytes(r.data));
			                }
			                pack.files.push(f);
			                savedKeys.add(r.k);
			                sizes.set(r.k, byteLengthOf(r.data));
			                savedState.set(f, { path: f.path, ref: f.zipObj });
			                if (isPackIconPath(f.path)) {
			                    const bytes = toBytes(r.data);
			                    icons[type] = bytes;
			                    pack.iconBlob = new Blob([bytes], { type: 'image/png' });
			                    pack.iconUrl = URL.createObjectURL(pack.iconBlob);
			                }
			            });
			            restored[type] = pack;
			        }
			        if (!restored.bp && !restored.rp) throw new Error('プロジェクトのデータが空です');

			        packsData = restored;
			        activeFile = null;
			        resetImageEditorState();
			        importedArchiveName = rec.importedArchiveName || null;
			        projectName = rec.nameCustom ? (rec.name || null) : null;
			        projectType = PROJECT_TYPES[rec.type] ? rec.type : DEFAULT_PROJECT_TYPE;
			        selectedFolderPath = "";
			        selectedFilePath = "";
			        openFoldersSet.clear();
			        fileInput.value = '';

			        currentProjectId = id;
			        projectCreatedAt = rec.createdAt || Date.now();
			        projectSavedKeys = savedKeys;
			        projectSavedState = savedState;
			        projectFileSizes = sizes;
			        projectIcons = icons;
			        projectLastMeta = buildProjectMeta().str; // 開いただけでは更新日時を変えない

			        finalizeImportAndOpen();
			        showLoading(false);
			    } catch (err) {
			        console.error(err);
			        showLoading(false);
			        alert(t("プロジェクトを開けませんでした: ") + t(err.message));
			        renderProjectList();
			    }
			}

			function requestDeleteProject(id, name) {
			    projectDeleteTargetId = id;
			    document.getElementById('projectDeleteName').textContent = name;
			    document.getElementById('projectDeleteModal').classList.remove('hidden');
			}

			function closeProjectDeleteModal() {
			    projectDeleteTargetId = null;
			    document.getElementById('projectDeleteModal').classList.add('hidden');
			}

			async function confirmDeleteProject() {
			    const id = projectDeleteTargetId;
			    closeProjectDeleteModal();
			    if (!id) return;
			    try {
			        const db = await openProjectDb();
			        const tx = db.transaction(['projects', 'files'], 'readwrite');
			        const done = idbTransactionDone(tx);
			        tx.objectStore('projects').delete(id);
			        tx.objectStore('files').delete(IDBKeyRange.bound(id + '|', id + '|\uffff'));
			        await done;
			    } catch (err) {
			        console.error(err);
			        alert(t("プロジェクトを削除できませんでした: ") + t(err.message));
			    }
			    renderProjectList();
			}

			function formatProjectDate(ms) {
			    try {
			        return new Date(ms).toLocaleString(currentLang === 'ja' ? 'ja-JP' : undefined, {
			            year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
			        });
			    } catch (e) { return ''; }
			}

			function buildProjectCard(p) {
			    const card = document.createElement('div');
			    card.className = 'flex items-stretch bg-mc-card border border-mc-border hover:border-emerald-500/60 rounded-xl overflow-hidden shadow-md transition-all';

			    const openBtn = document.createElement('button');
			    openBtn.type = 'button';
			    openBtn.className = 'flex-1 min-w-0 flex items-center gap-3 p-3 text-left';
			    openBtn.addEventListener('click', (e) => { e.stopPropagation(); openProject(p.id); });

			    const iconBox = document.createElement('div');
			    iconBox.className = 'w-11 h-11 rounded-lg bg-mc-dark border border-mc-border shrink-0 flex items-center justify-center overflow-hidden';
			    if (p.icon) {
			        const url = URL.createObjectURL(new Blob([p.icon], { type: 'image/png' }));
			        projectIconUrls.push(url);
			        iconBox.innerHTML = `<img src="${url}" class="w-full h-full object-cover image-render-pixelated" alt="">`;
			    } else {
			        iconBox.innerHTML = '<i data-lucide="package" class="w-5 h-5 text-slate-400"></i>';
			    }

			    const typeInfo = PROJECT_TYPES[p.type] || PROJECT_TYPES[DEFAULT_PROJECT_TYPE];

			    const info = document.createElement('div');
			    info.className = 'min-w-0 flex-1';

			    const nameRow = document.createElement('div');
			    nameRow.className = 'flex items-center gap-1.5 min-w-0';
			    const nameEl = document.createElement('p');
			    nameEl.setAttribute('data-no-i18n', '');
			    nameEl.className = 'text-xs font-bold text-white truncate min-w-0';
			    nameEl.textContent = p.name || 'Untitled';
			    const typeBadge = document.createElement('span');
			    typeBadge.className = 'shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
			    typeBadge.innerHTML = `<i data-lucide="${typeInfo.icon}" class="w-3 h-3"></i>`;
			    const typeLabel = document.createElement('span');
			    typeLabel.textContent = typeInfo.label;
			    typeBadge.appendChild(typeLabel);
			    nameRow.appendChild(nameEl);
			    nameRow.appendChild(typeBadge);

			    const sub = document.createElement('p');
			    sub.className = 'text-[10px] text-slate-400 flex items-center gap-x-2 flex-wrap mt-1';
			    const sizeEl = document.createElement('span');
			    sizeEl.setAttribute('data-no-i18n', '');
			    sizeEl.className = 'font-mono';
			    sizeEl.textContent = formatBytes(p.totalBytes);
			    const dateEl = document.createElement('span');
			    dateEl.setAttribute('data-no-i18n', '');
			    dateEl.className = 'font-mono';
			    dateEl.textContent = formatProjectDate(p.updatedAt);
			    sub.appendChild(sizeEl);
			    sub.appendChild(dateEl);
			    info.appendChild(nameRow);
			    info.appendChild(sub);

			    openBtn.appendChild(iconBox);
			    openBtn.appendChild(info);

			    const actionBtn = (title, icon, hoverClass, onClick) => {
			        const b = document.createElement('button');
			        b.type = 'button';
			        b.title = title;
			        b.setAttribute('aria-label', title);
			        b.className = `px-3 border-l border-mc-border text-slate-400 ${hoverClass} transition-colors flex items-center justify-center shrink-0`;
			        b.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i>`;
			        b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
			        return b;
			    };

			    card.appendChild(openBtn);
			    card.appendChild(actionBtn('プロジェクト名を変更', 'pencil', 'hover:text-emerald-400 hover:bg-emerald-500/10', () => requestRenameProject(p.id, p.name || '')));
			    card.appendChild(actionBtn('プロジェクトを削除', 'trash-2', 'hover:text-red-400 hover:bg-red-500/10', () => requestDeleteProject(p.id, p.name || 'Untitled')));
			    return card;
			}

			/* --- プロジェクト名の変更 --- */
			function requestRenameProject(id, name) {
			    projectRenameTargetId = id;
			    const input = document.getElementById('projectRenameInput');
			    input.value = name;
			    document.getElementById('projectRenameError').classList.add('hidden');
			    document.getElementById('projectRenameModal').classList.remove('hidden');
			    setTimeout(() => { input.focus(); input.select(); }, 0);
			}

			function closeProjectRenameModal() {
			    projectRenameTargetId = null;
			    document.getElementById('projectRenameModal').classList.add('hidden');
			}

			async function confirmRenameProject() {
			    const id = projectRenameTargetId;
			    if (!id) return;
			    const name = document.getElementById('projectRenameInput').value.trim();
			    const err = document.getElementById('projectRenameError');
			    if (!name) {
			        document.getElementById('projectRenameErrorText').textContent = t('名前を入力してください。');
			        err.classList.remove('hidden');
			        return;
			    }
			    closeProjectRenameModal();
			    try {
			        const db = await openProjectDb();
			        const store = db.transaction('projects', 'readwrite').objectStore('projects');
			        const rec = await idbRequest(store.get(id));
			        if (!rec) throw new Error('プロジェクトが見つかりません');
			        rec.name = name.slice(0, PROJECT_NAME_MAX);
			        rec.nameCustom = true; // 更新日時は変えない(並び順を保つ)
			        await idbRequest(store.put(rec));
			    } catch (e) {
			        console.error(e);
			        alert(t('プロジェクト名を変更できませんでした: ') + t(e.message));
			    }
			    renderProjectList();
			}

			// 以前のバージョンで保存されたプロジェクトには容量・種類の情報がないので、補って保存し直す
			async function backfillProjectRecord(db, rec) {
			    let changed = false;
			    if (rec.totalBytes == null) {
			        const files = await idbRequest(
			            db.transaction('files').objectStore('files').getAll(IDBKeyRange.bound(rec.id + '|', rec.id + '|\uffff'))
			        );
			        rec.totalBytes = files.reduce((sum, r) => sum + byteLengthOf(r.data), 0);
			        changed = true;
			    }
			    if (!PROJECT_TYPES[rec.type]) { rec.type = DEFAULT_PROJECT_TYPE; changed = true; }
			    if (changed) {
			        try { await idbRequest(db.transaction('projects', 'readwrite').objectStore('projects').put(rec)); } catch (e) {}
			    }
			}

			async function renderProjectList() {
			    const box = document.getElementById('projectList');
			    const countEl = document.getElementById('projectCount');
			    if (!box) return;

			    let list = [];
			    try {
			        const db = await openProjectDb();
			        list = await idbRequest(db.transaction('projects').objectStore('projects').getAll());
			        for (const rec of list) await backfillProjectRecord(db, rec);
			    } catch (err) {
			        console.error(err);
			        projectDbOk = false;
			        countEl.textContent = '';
			        box.innerHTML = '<div class="col-span-full border border-dashed border-mc-border rounded-xl p-5 text-center text-xs text-slate-500">この環境ではプロジェクトを保存できません。</div>';
			        return;
			    }

			    projectIconUrls.forEach(u => URL.revokeObjectURL(u));
			    projectIconUrls = [];
			    list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
			    countEl.textContent = list.length ? `(${list.length})` : '';
			    box.innerHTML = '';

			    if (!list.length) {
			        box.innerHTML = '<div class="col-span-full border border-dashed border-mc-border rounded-xl p-5 text-center text-xs text-slate-500">まだプロジェクトがありません。作成または読み込みをすると、ここに自動で保存されます。</div>';
			        return;
			    }
			    list.forEach(p => box.appendChild(buildProjectCard(p)));
			    lucide.createIcons();
			}

			function initProjects() {
			    renderProjectList();
			    // 編集操作のあと、少し待ってから自動保存する(変更がなければ何も書き込まれない)
			    ['input', 'change', 'click', 'pointerup', 'keyup'].forEach(ev => {
			        document.addEventListener(ev, () => { if (currentProjectId) scheduleProjectSave(); }, true);
			    });
			    document.addEventListener('visibilitychange', () => {
			        if (document.visibilityState === 'hidden' && currentProjectId) saveCurrentProject();
			    });
			    window.addEventListener('pagehide', () => { if (currentProjectId) saveCurrentProject(); });
			    const renameInput = document.getElementById('projectRenameInput');
			    renameInput.addEventListener('keydown', (e) => {
			        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); confirmRenameProject(); }
			        else if (e.key === 'Escape') closeProjectRenameModal();
			    });
			}


			/* =====================================================================
			   多言語対応 (i18n)
			   - 画面の文言は日本語をそのまま原文(キー)として持ち、英語などは辞書で置き換える
			   - 既定は利用者のブラウザの言語。ヘッダーの言語選択で切り替え(選択は保存)
			   - 対応言語を増やすには I18N_DICTS に辞書を追加し、index.html の select に option を足す
			   ===================================================================== */
			const I18N_STORAGE_KEY = 'addonforge.lang';
			const I18N_DICTS = {
			    en: {
			    "設定": "Settings",
			    "外観のカスタマイズ": "Appearance",
			    "端末の設定に合わせて自動で切り替わります。ここで変更した色は、": "Switches automatically with your device setting. Colors changed here are saved for ",
			    "用として保存されます。": " mode.",
			    "ダークモード": "dark",
			    "ライトモード": "light",
			    "アクセントカラー(ボタン・アイコン)": "Accent color (buttons & icons)",
			    "背景色": "Background color",
			    "カードや枠線の色は、背景色から自動で調整されます。": "Card and border colors are adjusted automatically from the background color.",
			    "初期値に戻す": "Reset to default",
			    "閉じる": "Close",
			    "開く": "Open",
			    "出力": "Export",
			    "新規作成": "Create New",
			    "プロジェクトを新規作成": "Create New Project",
			    "過去のプロジェクト": "Past Projects",
			    "まだプロジェクトがありません。作成または読み込みをすると、ここに自動で保存されます。": "No projects yet. Projects you create or open are saved here automatically.",
			    "この環境ではプロジェクトを保存できません。": "Projects cannot be saved in this environment.",
			    "プロジェクトを削除": "Delete project",
			    "プロジェクト名を変更": "Rename project",
			    "プロジェクト名": "Project name",
			    "プロジェクト名を変更できませんでした:": "Could not rename the project:",
			    "アドオン": "Addon",
			    "テクスチャ": "Texture",
			    "ファイル": "Files",
			    "バニラから探す": "Find vanilla textures",
			    "編集中のテクスチャ": "My edited textures",
			    "見つかりませんでした。別のキーワードを試してください。": "Nothing found. Try another keyword.",
			    "まだ編集したテクスチャがありません。「バニラから探す」で選ぶと、ここに追加されます。": "No edited textures yet. Pick one from \"Find vanilla textures\" and it appears here.",
			    "バニラテクスチャを読み込み中...": "Loading vanilla textures...",
			    "容量が大きいため、少し時間がかかります": "This may take a while because the file is large",
			    "読み込めませんでした: ": "Could not load: ",
			    "textures フォルダが見つかりません": "No textures folder found",
			    "モブ・乗り物": "Mobs & vehicles", "防具（着用）": "Armor (worn)", "防具の装飾": "Armor trims", "ブロック破壊の亀裂": "Block-breaking cracks", "UI（ゲージ・アイコン）": "UI (bars & icons)", "画面・メニュー": "Screens & menus", "マップ": "Maps", "色（草・葉）": "Color maps (grass & leaves)", "その他": "Other",
			    "ブロック": "Blocks", "アイテム": "Items", "モブ・防具": "Mobs & armor", "パーティクル": "Particles", "空・天気": "Sky & weather", "絵画": "Paintings",
			    "プロジェクトタイプ": "Project type",
			    "作成": "Create",
			    "ビヘイビア + リソースパック": "Behavior + Resource pack",
			    "リソースパックのみ・画像編集向け": "Resource pack only, for image editing",
			    "テクスチャ名で検索": "Search by texture name",
			    "テクスチャを追加": "Add textures",
			    "すべて": "All",
			    "さらに表示": "Show more",
			    "サムネイルをクリックすると画像エディタで開きます。同じ名前の画像を追加すると差し替わります（追加先は選択中のカテゴリ）。": "Click a thumbnail to open it in the image editor. Adding an image with the same name replaces it (added to the selected category).",
			    "テクスチャがありません。「テクスチャを追加」から画像（PNG / JPEG）を追加してください。": "No textures yet. Use \"Add textures\" to add images (PNG / JPEG).",
			    "このプロジェクトを削除しますか？": "Delete this project?",
			    "保存されているデータは元に戻せません。": "The saved data cannot be restored.",
			    "プロジェクトを読み込み中...": "Loading project...",
			    "保存されたパックを復元しています": "Restoring the saved packs",
			    "プロジェクトを開けませんでした:": "Could not open the project:",
			    "プロジェクトを削除できませんでした:": "Could not delete the project:",
			    "プロジェクトが見つかりません": "Project not found",
			    "プロジェクトのデータが空です": "The project data is empty",
			    "編集内容はプロジェクトとして自動保存されます。開いているパックを閉じて、初期画面に戻ります。": "Your edits are saved automatically as a project. The open packs will be closed and you will return to the start screen.",
			    "ここにファイルをドラッグ＆ドロップ または タップして選択して開く": "Drag & drop a file here, or tap to select and open",
			    "対応フォーマット:": "Supported formats:",
			    "必須項目に未入力があります。": "Some required fields are empty.",
			    "マニフェスト": "Manifest",
			    "ファイル階層・編集": "Files & Editor",
			    "タップしてパックアイコン画像を変更": "Tap to change the pack icon image",
			    "変更": "Change",
			    "必須項目": "Required",
			    "パック名": "Pack name",
			    "例: Pack Name": "e.g. Pack Name",
			    "UUIDを再生成": "Regenerate UUID",
			    "パックバージョン": "Pack version",
			    "最小エンジンバージョン (Min Engine)": "Minimum engine version (Min Engine)",
			    "任意項目": "Optional",
			    "製作者 (Authors)": "Authors",
			    "カンマ区切り (例: Steve, Alex)": "Comma-separated (e.g. Steve, Alex)",
			    "説明文 (Description)": "Description",
			    "アドオンの説明": "Add-on description",
			    "リソースパックとの連携 (RP Dependency)": "Link to resource pack (RP Dependency)",
			    "ライセンス (License)": "License",
			    "MIT, CC-BY-4.0 等": "e.g. MIT, CC-BY-4.0",
			    "Webサイト / URL": "Website / URL",
			    "Script API 設定 (BP)": "Script API settings (BP)",
			    "エントリーポイント (.js の前のファイル名)": "Entry points (file name before .js)",
			    "追加": "Add",
			    "ファイル名が重複しています。重複した2つ目以降はマニフェストに反映されません。": "File names are duplicated. Duplicates after the first are not included in the manifest.",
			    "使用するモジュールとバージョン": "Modules and versions to use",
			    "ここをタップすると選択を解除します": "Tap here to clear the selection",
			    "パック未選択": "No pack selected",
			    "新しいファイルを追加": "Add a new file",
			    "新しいフォルダを追加": "Add a new folder",
			    "既存のファイルをインポート追加": "Import existing files",
			    "ファイルを選択してください": "Select a file",
			    "コード整形": "Format code",
			    "エクスポート": "Export",
			    "このファイルだけをダウンロード": "Download only this file",
			    "ファイルを選択するとコードエディタが開きます": "Select a file to open the code editor",
			    "このファイル形式はプレビューまたはテキスト編集に対応していません": "This file type doesn't support preview or text editing",
			    "名前変更": "Rename",
			    "移動": "Move",
			    "ファイルを削除": "Delete file",
			    "フォルダを削除": "Delete folder",
			    "その他の操作": "More actions",
			    "手のひら (H) 表示位置を移動": "Hand (H) Pan the view",
			    "ペン (B)": "Pen (B)",
			    "消しゴム (E)": "Eraser (E)",
			    "塗りつぶし (G)": "Fill (G)",
			    "スポイト (I)": "Eyedropper (I)",
			    "直線 (L) Shiftで角度固定": "Line (L) Hold Shift to snap the angle",
			    "四角形 (R) Shiftで正方形": "Rectangle (R) Hold Shift for a square",
			    "楕円 (O) Shiftで正円": "Ellipse (O) Hold Shift for a circle",
			    "元に戻す (Ctrl+Z)": "Undo (Ctrl+Z)",
			    "やり直し (Ctrl+Y)": "Redo (Ctrl+Y)",
			    "縦横サイズの変更": "Change width and height",
			    "サイズ変更": "Resize",
			    "左右反転": "Flip horizontal",
			    "上下反転": "Flip vertical",
			    "左に90°回転": "Rotate 90° left",
			    "左回転": "Rotate left",
			    "右に90°回転": "Rotate 90° right",
			    "右回転": "Rotate right",
			    "全体を透明にする": "Make everything transparent",
			    "全消去": "Clear all",
			    "色": "Color",
			    "カラーピッカー": "Color picker",
			    "HEXコードで指定": "Specify by HEX code",
			    "不透明度": "Opacity",
			    "サイズ": "Size",
			    "形": "Shape",
			    "四角": "Square",
			    "丸": "Round",
			    "図形": "Figure",
			    "枠線": "Outline",
			    "塗りつぶし": "Fill",
			    "許容差": "Tolerance",
			    "JPEG画質": "JPEG quality",
			    "ピクセルグリッド (拡大時に表示)": "Pixel grid (shown when zoomed in)",
			    "縮小 (-)": "Zoom out (-)",
			    "拡大 (+)": "Zoom in (+)",
			    "画面に合わせる": "Fit to screen",
			    "JPEGは透明に対応していません。透明部分は白で保存されます。": "JPEG does not support transparency. Transparent areas are saved as white.",
			    "編集内容は自動で適用されます。右上の「エクスポート」でこの画像だけを保存できます。": "Edits are applied automatically. Use \"Export\" at the top right to save just this image.",
			    "手のひら": "Hand",
			    "ドラッグで表示位置を動かします。": "Drag to move the view.",
			    "ペン": "Pen",
			    "タップ/ドラッグで描画します。": "Tap/drag to draw.",
			    "消しゴム": "Eraser",
			    "タップ/ドラッグで透明にします。": "Tap/drag to make pixels transparent.",
			    "同じ色でつながった範囲を塗りつぶします。": "Fills the connected area of the same color.",
			    "スポイト": "Eyedropper",
			    "タップした位置の色を取得します。": "Picks the color at the tapped position.",
			    "直線": "Line",
			    "ドラッグで直線を引きます(Shiftで角度を固定)。": "Drag to draw a line (hold Shift to snap the angle).",
			    "四角形": "Rectangle",
			    "ドラッグで四角形を描きます(Shiftで正方形)。": "Drag to draw a rectangle (Shift for a square).",
			    "楕円": "Ellipse",
			    "ドラッグで楕円を描きます(Shiftで正円)。": "Drag to draw an ellipse (Shift for a circle).",
			    "画像サイズの変更": "Change image size",
			    "現在:": "Current:",
			    "拡大・縮小": "Scale",
			    "画像ごと伸縮する": "Stretches the whole image",
			    "キャンバス変更": "Canvas size",
			    "絵は等倍のまま拡張/切り抜き": "Extend or crop; artwork stays at 100%",
			    "幅 (px)": "Width (px)",
			    "縦横比を固定": "Lock aspect ratio",
			    "高さ (px)": "Height (px)",
			    "補間方法": "Interpolation",
			    "ニアレストネイバー(ドット絵向け・くっきり)": "Nearest neighbor (for pixel art, crisp)",
			    "スムーズ(なめらか)": "Smooth",
			    "元画像の配置位置": "Anchor position of the original image",
			    "拡張した部分は透明になります(JPEGは白)。小さくすると、はみ出た部分は切り取られます。": "Extended areas become transparent (white for JPEG). When shrinking, anything outside is cropped.",
			    "キャンセル": "Cancel",
			    "サイズを変更": "Apply size",
			    "幅・高さが2の累乗(16, 32, 64, 128…)ではありません。テクスチャによっては表示が乱れる場合があります。": "Width and height are not powers of 2 (16, 32, 64, 128…). Some textures may render incorrectly.",
			    "読み込み中...": "Loading...",
			    "アドオンパック構造を解析しています": "Analyzing the add-on pack structure",
			    "新規パック作成中...": "Creating a new pack...",
			    "アドオンパック構造の解析中...": "Analyzing the add-on pack structure...",
			    "読み込むパックを選択": "Choose packs to load",
			    "このファイルには": "This file contains both the",
			    "ビヘイビアパック(BP)": "Behavior Pack (BP)",
			    "と": "and the",
			    "リソースパック(RP)": "Resource Pack (RP).",
			    "の両方が含まれています。どちらを読み込むか選択してください。": "Choose which one to load.",
			    "両方 (BP + RP)": "Both (BP + RP)",
			    "両方のパックをそのまま読み込みます": "Load both packs as they are",
			    "ビヘイビアパックのみ": "Behavior pack only",
			    "RPは新規作成時の状態になります": "The RP will be reset to its newly created state",
			    "リソースパックのみ": "Resource pack only",
			    "BPは新規作成時の状態になります": "The BP will be reset to its newly created state",
			    "読み込む": "Load",
			    "パックを出力": "Export packs",
			    "出力するパックを選択してください:": "Choose which packs to export:",
			    "出力フォーマットを選択してください:": "Choose an export format:",
			    "ダウンロード": "Download",
			    "ビヘイビアパックとリソースパックの両方を出力します": "Exports both the behavior pack and the resource pack",
			    "リソースパック単体を出力します": "Exports the resource pack alone",
			    "ビヘイビアパック単体を出力します": "Exports the behavior pack alone",
			    ".mcaddon (統合パック)": ".mcaddon (combined pack)",
			    "BPとRPを一つにまとめて出力します（推奨）": "Exports BP and RP together as one file (recommended)",
			    "BPとRPをまとめたzipファイルで出力します": "Exports BP and RP as a single zip file",
			    "パック単体を出力します（推奨）": "Exports the pack alone (recommended)",
			    "パック単体をzipファイルで出力します": "Exports the pack alone as a zip file",
			    "パックを圧縮・生成中...": "Compressing and generating the pack...",
			    "ファイルをパッケージングしています": "Packaging files",
			    "フォルダを圧縮中...": "Compressing the folder...",
			    "新規ファイル作成": "Create new file",
			    "新規フォルダ作成": "Create new folder",
			    "外部ファイル取り込み": "Import external files",
			    "エラーが発生しました。": "An error occurred.",
			    "追加先パス": "Destination path",
			    "名前 (拡張子含む)": "Name (with extension)",
			    "例: custom_item.json": "e.g. custom_item.json",
			    "例: item.json": "e.g. item.json",
			    "フォルダ名": "Folder name",
			    "画像サイズ (px)": "Image size (px)",
			    "幅": "Width",
			    "高さ": "Height",
			    "透明な画像として作成されます(JPEGは白)。": "Created as a transparent image (white for JPEG).",
			    "作成": "Create",
			    "移動するもの": "Item to move",
			    "移動先のフォルダ": "Destination folder",
			    "移動する": "Move",
			    "(ルート)": "(root)",
			    "名称変更 (リネーム)": "Rename",
			    "新しい名前": "New name",
			    "本当に削除しますか？": "Are you sure you want to delete this?",
			    "削除する": "Delete",
			    "初期画面に戻りますか？": "Return to the start screen?",
			    "未保存の編集内容や読み込まれたパックデータはすべてクリアされます。": "All edits and loaded pack data will be cleared.",
			    "戻る": "Return",
			    "先にパックを読み込んでください。": "Please load a pack first.",
			    "パックが読み込まれていません。": "No pack has been loaded.",
			    "ファイルの解析に失敗しました:": "Failed to parse the file:",
			    "JSONの構文にエラーがあるため整形できませんでした。": "The JSON has syntax errors, so it could not be formatted.",
			    "パック名またはUUIDが入力されていません。": "Pack name or UUID is not filled in.",
			    "ファイル名を入力してください。": "Enter a file name.",
			    "拡張子を含めたファイル名を入力してください。（例: item.json）": "Enter a file name including its extension. (e.g. item.json)",
			    "拡張子のみのファイル名は使用できません。ファイル名を入力してください。（例: item.json）": "A file name consisting only of an extension is not allowed. Enter a file name. (e.g. item.json)",
			    "拡張子を入力してください。（例: item.json）": "Enter an extension. (e.g. item.json)",
			    "同名のファイルが既に存在します。": "A file with the same name already exists.",
			    "同名のフォルダが既に存在するため、このファイル名は使用できません。": "A folder with the same name already exists, so this file name cannot be used.",
			    "フォルダ名を入力してください。": "Enter a folder name.",
			    "同名のフォルダが既に存在します。": "A folder with the same name already exists.",
			    "同名のファイルが既に存在するため、このフォルダ名は使用できません。": "A file with the same name already exists, so this folder name cannot be used.",
			    "名前を入力してください。": "Enter a name.",
			    "出力エラーが発生しました:": "Export error:",
			    "manifest.json はルートから移動できません。": "manifest.json cannot be moved out of the root.",
			    "移動先のフォルダを選択してください。": "Select a destination folder.",
			    "すでにそのフォルダにあります。": "It is already in that folder.",
			    "移動先に同名のファイルが既に存在します。": "A file with the same name already exists at the destination.",
			    "移動先に同名のフォルダが既に存在します。": "A folder with the same name already exists at the destination.",
			    "フォルダを自分自身の中には移動できません。": "A folder cannot be moved into itself.",
			    "TGAヘッダーが短すぎます": "The TGA header is too short",
			    "TGAのサイズが不正です": "Invalid TGA size",
			    "未対応のカラーマップ形式です": "Unsupported color map format",
			    "TGAのデータが不足しています": "The TGA data is incomplete",
			    "TGAの最大サイズ(65535px)を超えています": "Exceeds the maximum TGA size (65535px)",
			    "ファイルデータが見つかりません": "File data not found",
			    "画像を読み込めませんでした": "Could not load the image",
			    "画像のエンコードに失敗しました": "Failed to encode the image",
			    "画像の保存に失敗しました:": "Failed to save the image:"
			}
			};
			// 数値や名前を含む文言(正規表現 → 変換関数)
			const I18N_PATTERNS = {
			    en: [
			        [/^(\d+) ファイル$/, (m) => `${m[1]} files`],
			        [/^幅と高さは 1〜(\d+) の整数で入力してください。$/, (m) => `Enter whole numbers from 1 to ${m[1]} for width and height.`],
			        [/^ファイル "(.*)" に拡張子がありません。拡張子のないファイルは追加できません。$/, (m) => `File "${m[1]}" has no extension. Files without an extension cannot be added.`],
			        [/^この画像はエディタで開けませんでした\((.*)\)。プレビュー表示に切り替えます。$/, (m) => `This image could not be opened in the editor (${t(m[1])}). Switching to preview.`],
			        [/^(.*) \(フォルダ全体\)$/, (m) => `${m[1]} (entire folder)`],
			        [/^未対応のTGA形式です \(type (\d+)\)$/, (m) => `Unsupported TGA format (type ${m[1]})`],
			        [/^未対応のビット深度です \((\d+)bit\)$/, (m) => `Unsupported bit depth (${m[1]}-bit)`]
			    ]
			};
			const I18N_SUPPORTED = ['ja'].concat(Object.keys(I18N_DICTS));
			const I18N_JP_RE = /[\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]/;
			const I18N_ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
			let currentLang = 'ja';

			function i18nTranslateCore(core) {
			    const dict = I18N_DICTS[currentLang];
			    if (!dict) return null;
			    if (Object.prototype.hasOwnProperty.call(dict, core)) return dict[core];
			    for (const [re, fn] of (I18N_PATTERNS[currentLang] || [])) {
			        const m = core.match(re);
			        if (m) return fn(m);
			    }
			    // 「ラベル: 説明」形式は前後を別々に翻訳する
			    const idx = core.indexOf(': ');
			    if (idx > 0) {
			        const a = i18nTranslateCore(core.slice(0, idx));
			        const b = i18nTranslateCore(core.slice(idx + 2));
			        if (a !== null || b !== null) return (a === null ? core.slice(0, idx) : a) + ': ' + (b === null ? core.slice(idx + 2) : b);
			    }
			    return null;
			}

			// 現在の言語へ翻訳する(日本語・辞書に無い文言はそのまま返す)。alert などDOM以外の文言用。
			function t(str) {
			    if (currentLang === 'ja' || typeof str !== 'string' || !I18N_JP_RE.test(str)) return str;
			    const lead = str.match(/^\s*/)[0];
			    const trail = str.length > lead.length ? str.match(/\s*$/)[0] : '';
			    const core = str.slice(lead.length, str.length - trail.length).replace(/\s+/g, ' ');
			    const out = i18nTranslateCore(core);
			    return out === null ? str : lead + out + trail;
			}

			// 翻訳前の原文を覚えておき、日本語へ戻せるようにする(訳文のままの場合のみ復元)
			const i18nTextOrig = new WeakMap();
			const i18nAttrOrig = new WeakMap();

			function i18nInSkipArea(el) {
			    return !!(el && el.closest && el.closest('[data-no-i18n], script, style'));
			}
			function i18nTranslateTextNode(node) {
			    if (currentLang === 'ja') return;
			    const val = node.nodeValue;
			    if (!val || !I18N_JP_RE.test(val)) return;
			    const parent = node.parentElement;
			    if (i18nInSkipArea(parent) || (parent && parent.closest('[data-i18n-attrs-only]'))) return;
			    const out = t(val);
			    if (out !== val) {
			        i18nTextOrig.set(node, { orig: val, tr: out });
			        node.nodeValue = out;
			    }
			}
			function i18nTranslateAttr(el, attr) {
			    if (currentLang === 'ja' || i18nInSkipArea(el)) return;
			    const val = el.getAttribute(attr);
			    if (!val || !I18N_JP_RE.test(val)) return;
			    const out = t(val);
			    if (out !== val) {
			        const rec = i18nAttrOrig.get(el) || {};
			        rec[attr] = { orig: val, tr: out };
			        i18nAttrOrig.set(el, rec);
			        el.setAttribute(attr, out);
			    }
			}
			function i18nWalk(root, onText, onEl) {
			    if (root.nodeType === 3) { onText(root); return; }
			    if (root.nodeType !== 1 || i18nInSkipArea(root)) return;
			    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
			        acceptNode(n) {
			            if (n.nodeType === 1 && n.matches('[data-no-i18n], script, style')) return NodeFilter.FILTER_REJECT;
			            return NodeFilter.FILTER_ACCEPT;
			        }
			    });
			    onEl(root);
			    let n;
			    while ((n = walker.nextNode())) {
			        if (n.nodeType === 3) onText(n); else onEl(n);
			    }
			}
			function i18nTranslateTree(root) {
			    i18nWalk(root, i18nTranslateTextNode, (el) => I18N_ATTRS.forEach(a => { if (el.hasAttribute(a)) i18nTranslateAttr(el, a); }));
			}
			function i18nRestoreTree(root) {
			    i18nWalk(root, (node) => {
			        const rec = i18nTextOrig.get(node);
			        if (rec && node.nodeValue === rec.tr) node.nodeValue = rec.orig;
			        i18nTextOrig.delete(node);
			    }, (el) => {
			        const rec = i18nAttrOrig.get(el);
			        if (!rec) return;
			        Object.keys(rec).forEach(a => {
			            if (el.getAttribute(a) === rec[a].tr) el.setAttribute(a, rec[a].orig);
			        });
			        i18nAttrOrig.delete(el);
			    });
			}

			// 動的に追加・変更された文言も自動で翻訳する
			const i18nObserver = new MutationObserver((muts) => {
			    if (currentLang === 'ja') return;
			    for (const m of muts) {
			        if (m.type === 'childList') m.addedNodes.forEach(n => i18nTranslateTree(n));
			        else if (m.type === 'characterData') i18nTranslateTextNode(m.target);
			        else if (m.type === 'attributes') i18nTranslateAttr(m.target, m.attributeName);
			    }
			});
			function i18nObserve() {
			    i18nObserver.observe(document.body, {
			        childList: true, subtree: true, characterData: true,
			        attributes: true, attributeFilter: I18N_ATTRS
			    });
			}

			function setLanguage(lang, persist = true) {
			    if (!I18N_SUPPORTED.includes(lang)) lang = 'en';
			    const prev = currentLang;
			    currentLang = lang;
			    document.documentElement.lang = lang;
			    if (persist) { try { localStorage.setItem(I18N_STORAGE_KEY, lang); } catch (e) {} }
			    if (prev === lang) return;
			    i18nObserver.disconnect();
			    if (lang === 'ja') i18nRestoreTree(document.body);
			    else i18nTranslateTree(document.body);
			    i18nObserve();
			}

			// 保存済みの選択 → ブラウザの言語 → 英語 の順で決定する
			function detectLanguage() {
			    try {
			        const saved = localStorage.getItem(I18N_STORAGE_KEY);
			        if (saved && I18N_SUPPORTED.includes(saved)) return saved;
			    } catch (e) {}
			    const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
			    for (const l of list) {
			        const code = String(l).toLowerCase().split('-')[0];
			        if (I18N_SUPPORTED.includes(code)) return code;
			    }
			    return 'en';
			}

			// 言語メニュー(タップした時だけ、それぞれの言語の正式名称で表示する)
			const I18N_LANG_LABELS = { ja: '日本語', en: 'English' };
			function openLangMenu() {
			    const anchor = document.getElementById('langMenuBtn');
			    if (treeMenuEl && treeMenuAnchor === anchor) { closeTreeMenu(); return; }
			    closeTreeMenu();
			    const menu = document.createElement('div');
			    menu.className = 'tree-menu';
			    menu.setAttribute('data-no-i18n', '');
			    menu.addEventListener('click', (e) => e.stopPropagation());
			    I18N_SUPPORTED.forEach(code => {
			        const item = document.createElement('button');
			        item.type = 'button';
			        item.className = 'tree-menu-item' + (code === currentLang ? ' active' : '');
			        item.innerHTML = `<i data-lucide="${code === currentLang ? 'check' : 'globe'}" class="w-3.5 h-3.5 shrink-0"></i><span></span>`;
			        item.lastChild.textContent = I18N_LANG_LABELS[code] || code;
			        item.addEventListener('click', () => { closeTreeMenu(); setLanguage(code); });
			        menu.appendChild(item);
			    });
			    document.body.appendChild(menu);
			    treeMenuEl = menu;
			    treeMenuAnchor = anchor;
			    lucide.createIcons();

			    const r = anchor.getBoundingClientRect();
			    const mw = menu.offsetWidth, mh = menu.offsetHeight;
			    const left = Math.min(Math.max(8, r.right - mw), window.innerWidth - mw - 8);
			    let top = r.bottom + 4;
			    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
			    menu.style.left = left + 'px';
			    menu.style.top = top + 'px';
			}

			function initI18n() {
			    const btn = document.getElementById('langMenuBtn');
			    if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); openLangMenu(); });
			    // ファイル名・行番号などユーザーのデータは翻訳しない(ボタンのツールチップだけ翻訳する)
			    document.getElementById('lineNumbers').setAttribute('data-no-i18n', '');
			    treeContainer.setAttribute('data-i18n-attrs-only', '');
			    i18nObserve();
			    setLanguage(detectLanguage(), false);
			}
			initI18n();

			/* =====================================================================
			   設定モーダル(外観のカスタマイズ)
			   - 色の計算・保存・反映は index.html の AddonTheme が担当する
			   ===================================================================== */
			function syncSettingsUI() {
			    if (!window.AddonTheme) return;
			    const c = AddonTheme.current();
			    document.getElementById('themeModeLabel').textContent = c.scheme === 'light' ? 'ライトモード' : 'ダークモード';
			    const setIfIdle = (id, val) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = val; };
			    setIfIdle('themeAccentPicker', c.accent);
			    setIfIdle('themeAccentHex', c.accent.toUpperCase());
			    setIfIdle('themeBgPicker', c.bg);
			    setIfIdle('themeBgHex', c.bg.toUpperCase());
			}
			function openSettingsModal() {
			    closeTreeMenu();
			    ['themeAccentPicker', 'themeAccentHex', 'themeBgPicker', 'themeBgHex'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
			    syncSettingsUI();
			    document.getElementById('settingsModal').classList.remove('hidden');
			    lucide.createIcons();
			}
			function closeSettingsModal() {
			    document.getElementById('settingsModal').classList.add('hidden');
			}
			function resetThemeColors() {
			    AddonTheme.reset();
			    ['themeAccentPicker', 'themeAccentHex', 'themeBgPicker', 'themeBgHex'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
			    syncSettingsUI();
			}
			(function initSettingsModal() {
			    const normHex = (v) => { v = String(v || '').trim(); if (v[0] !== '#') v = '#' + v; return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
			    const bind = (key, pickerId, hexId) => {
			        const picker = document.getElementById(pickerId), hex = document.getElementById(hexId);
			        picker.addEventListener('input', () => { hex.value = picker.value.toUpperCase(); AddonTheme.set({ [key]: picker.value }); });
			        hex.addEventListener('input', () => {
			            const v = normHex(hex.value);
			            if (v) { picker.value = v; AddonTheme.set({ [key]: v }); }
			        });
			        hex.addEventListener('blur', () => syncSettingsUI());
			    };
			    bind('accent', 'themeAccentPicker', 'themeAccentHex');
			    bind('bg', 'themeBgPicker', 'themeBgHex');
			    // 端末のライト/ダーク切り替えに追従して、開いている設定画面の表示も更新する
			    AddonTheme.onChange(() => {
			        const m = document.getElementById('settingsModal');
			        if (m && !m.classList.contains('hidden')) {
			            ['themeAccentPicker', 'themeBgPicker'].forEach(id => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = ''; });
			            syncSettingsUI();
			        }
			    });
			    document.addEventListener('keydown', (e) => {
			        if (e.key === 'Escape') {
			            const m = document.getElementById('settingsModal');
			            if (m && !m.classList.contains('hidden')) closeSettingsModal();
			        }
			    });
			})();
