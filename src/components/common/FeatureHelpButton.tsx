import { useState } from 'react';
import Modal from './Modal';
import { HelpCircle } from 'lucide-react';

interface HelpContent {
  title: string;
  description?: string;
  sections: {
    heading: string;
    items: string[];
  }[];
}

interface Props {
  content: HelpContent;
}

export default function FeatureHelpButton({ content }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-[#e6f4ff] text-[#1677ff] text-xs font-medium rounded border border-[#91caff] hover:bg-[#bae0ff] transition-colors"
        title="功能操作逻辑说明"
      >
        <HelpCircle size={14} />
        <span>功能操作说明</span>
      </button>

      <Modal
        open={open}
        title={content.title}
        onClose={() => setOpen(false)}
        width="max-w-[700px]"
      >
        <div className="space-y-4 text-sm text-[#606266]">
          {content.description && (
            <p className="text-[#303133]">{content.description}</p>
          )}
          {content.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-[#303133] font-semibold mb-2 text-[13px]">
                {idx + 1}. {section.heading}
              </h4>
              <ul className="space-y-1 pl-5 list-disc">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
