// --- Configuration & Mappings ---

// Maps Highlight.js language names to file extensions
const EXTENSION_MAP = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    swift: 'swift',
    kotlin: 'kt',
    html: 'html',
    css: 'css',
    json: 'json',
    sql: 'sql',
    bash: 'sh',
    markdown: 'md',
    // Fallbacks for auto-detect aliases
    'c++': 'cpp',
    'c#': 'cs',
    shell: 'sh',
    xml: 'xml',
    yaml: 'yaml',
    plaintext: 'txt'
};

// --- DOM Elements ---

const codeInput = document.getElementById('code-input');
const codePreview = document.getElementById('code-preview');
const filenameInput = document.getElementById('filename');
const extensionPreview = document.getElementById('extension-preview');
const languageSelect = document.getElementById('language');
const detectedLangBadge = document.getElementById('detected-lang');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const previewBtn = document.getElementById('preview-btn');

// --- State ---

let currentLanguage = 'plaintext';

// --- Utility Functions ---

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getExtensionForLanguage(lang) {
    return EXTENSION_MAP[lang] || 'txt';
}

function getCurrentExtension() {
    if (languageSelect.value === 'auto') {
        return getExtensionForLanguage(currentLanguage);
    }
    return getExtensionForLanguage(languageSelect.value);
}

// --- Core Logic ---

function updatePreview() {
    const code = codeInput.value;

    if (!code.trim()) {
        codePreview.textContent = '';
        detectedLangBadge.textContent = '';
        currentLanguage = 'plaintext';
        extensionPreview.textContent = '.txt';
        previewBtn.style.display = 'none';
        return;
    }

    let result;

    if (languageSelect.value === 'auto') {
        // Auto-detect mode
        result = hljs.highlightAuto(code);
        currentLanguage = result.language || 'plaintext';
        detectedLangBadge.textContent = `Detected: ${currentLanguage}`;
    } else {
        // Manual override mode
        const selectedLang = languageSelect.value;
        result = hljs.highlight(code, { language: selectedLang, ignoreIllegals: true });
        currentLanguage = selectedLang;
        detectedLangBadge.textContent = `Manual: ${selectedLang}`;
    }

    codePreview.innerHTML = result.value;
    extensionPreview.textContent = `.${getCurrentExtension()}`;

    // Toggle preview button visibility based on language
    if (currentLanguage === 'html') {
        previewBtn.style.display = 'inline-block';
    } else {
        previewBtn.style.display = 'none';
    }
}

function downloadFile() {
    const code = codeInput.value;
    
    if (!code.trim()) {
        alert('Please enter some code first.');
        return;
    }

    // Get base name and strip any extension the user might have accidentally typed
    const baseName = filenameInput.value.trim() || 'untitled';
    const cleanBaseName = baseName.replace(/\.[^/.]+$/, ""); 
    
    const extension = getCurrentExtension();
    const finalFilename = `${cleanBaseName}.${extension}`;

    // Create and trigger download
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function openInBrowser() {
    const code = codeInput.value;
    
    if (!code.trim()) {
        alert('Please enter some HTML first.');
        return;
    }

    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(code);
        newWindow.document.close();
    } else {
        alert('Pop-up blocked. Please allow pop-ups for this site to preview HTML.');
    }
}

async function copyToClipboard() {
    const code = codeInput.value;
    
    if (!code.trim()) {
        alert('Nothing to copy.');
        return;
    }

    try {
        await navigator.clipboard.writeText(code);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#10b981';
        copyBtn.style.color = 'white';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
            copyBtn.style.color = '';
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard.');
    }
}

// --- Initialization & Event Listeners ---

// Debounced update for typing performance
const debouncedUpdate = debounce(updatePreview, 300);

codeInput.addEventListener('input', debouncedUpdate);

languageSelect.addEventListener('change', () => {
    // Immediate update when language is manually changed
    updatePreview();
});

filenameInput.addEventListener('input', () => {
    // Update the extension preview in real-time as they type the filename
    const baseName = filenameInput.value.trim() || 'untitled';
    const cleanBaseName = baseName.replace(/\.[^/.]+$/, "");
    extensionPreview.textContent = `.${getCurrentExtension()}`;
});

downloadBtn.addEventListener('click', downloadFile);
copyBtn.addEventListener('click', copyToClipboard);
previewBtn.addEventListener('click', openInBrowser);

// Initial render
updatePreview();