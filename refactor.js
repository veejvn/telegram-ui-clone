const fs = require('fs');
let content = fs.readFileSync('src/components/chat/ChatComposer.tsx', 'utf8');

// Add new imports
const importIndex = content.indexOf('import ForwardContactsList');
content = content.substring(0, importIndex) + 'import { useKeyboardDetect } from "@/hooks/useKeyboardDetect";\nimport { useSendHandlers } from "@/hooks/useSendHandlers";\nimport AttachmentSheet from "@/components/chat/AttachmentSheet";\n' + content.substring(importIndex);

// Replace LocationMap import and state
content = content.replace('const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);', 'const isKeyboardOpen = useKeyboardDetect(textareaRef);');
content = content.replace(/const LocationMap = dynamic\([\s\S]*?ssr: false,\n  }\);\n/, '');

// Remove handleStickerSelect and handleImagesAndVideos and replace with hook
const stickerStart = content.indexOf('  const handleStickerSelect = async');
const stickerEnd = content.indexOf('e.target.value = ""; // reset input\n  };', stickerStart) + 38;
const removed1 = content.substring(stickerStart, stickerEnd + 1);

const hookCode = `  const {
    handleImagesAndVideos,
    handleSendLocation,
    handleSendFile,
    handleStickerSelect,
  } = useSendHandlers({
    roomId,
    client: client || null,
    setOpen,
    setShowStickers,
  });\n`;

content = content.replace(removed1, hookCode);

// Remove handleSendLocation and handleSendFile
const locStart = content.indexOf('  const handleSendLocation = async');
const locEnd = content.indexOf('console.error("Failed to send file:", error);\n      }\n    }\n  };', locStart) + 67;
const removed2 = content.substring(locStart, locEnd + 1);
content = content.replace(removed2, '');

// Remove keyboard detect useEffect
const kbStart = content.indexOf('  // Detect keyboard open with improved Safari iOS support');
const kbEnd = content.indexOf('  }, []);', kbStart) + 9;
const removedKb = content.substring(kbStart, kbEnd + 1);
content = content.replace(removedKb, '');

// Replace attachment sheet JSX
const sheetStart = content.indexOf('        <AnimatePresence>\n          {open && (', content.indexOf('{/* Send Options Model */}'));
const sheetEnd = content.indexOf('        </AnimatePresence>\n      </div>\n    </>', sheetStart) + 26;
const removedSheet = content.substring(sheetStart, sheetEnd);

const replacementSheet = `        <AttachmentSheet
          isOpen={open}
          onClose={() => setOpen(false)}
          tab={tab}
          setTab={setTab}
          setSelectOpen={setSelectOpen}
          sheetRef={sheetRef}
          imageInputRef={imageInputRef}
          fileInputRef={fileInputRef}
          onImagesAndVideosChange={handleImagesAndVideos}
          onSendFileChange={handleSendFile}
          onSendLocation={handleSendLocation}
        />
      </div>
    </>`;

content = content.replace(removedSheet, replacementSheet);

fs.writeFileSync('src/components/chat/ChatComposer.tsx', content);
console.log('Done refactoring ChatComposer.tsx');
