import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

export interface NewDownloadValues {
  url: string;
  fileName: string;
}

interface NewDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: (values: NewDownloadValues[]) => void;
}

type DownloadSection = NewDownloadValues & {
  id: string;
};

function createSection(): DownloadSection {
  return {
    id: crypto.randomUUID(),
    url: "",
    fileName: "",
  };
}

export default function NewDownloadModal({
  open,
  onOpenChange,
  onStart,
}: NewDownloadModalProps) {
  const [sections, setSections] = useState<DownloadSection[]>([
    createSection(),
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart?.(
      sections.map(({ url, fileName }) => ({
        url,
        fileName,
      })),
    );
    onOpenChange(false);
  }

  function handleAddNewSection() {
    setSections((currentSections) => [...currentSections, createSection()]);
  }

  function handleRemoveSection(id: string) {
    setSections((currentSections) =>
      currentSections.filter((section) => section.id !== id),
    );
  }

  function handleSectionChange(
    id: string,
    field: keyof NewDownloadValues,
    value: string,
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section,
      ),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>New Download</DialogTitle>
            <DialogDescription>
              Add a download URL and choose the name of the saved file.
            </DialogDescription>
          </DialogHeader>

          {sections.map((section, index) => (
            <Section
              key={section.id}
              section={section}
              index={index}
              onChange={handleSectionChange}
              onRemove={handleRemoveSection}
            />
          ))}

          <DialogFooter className="mt-1 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddNewSection}
              >
                Add New Section
              </Button>
              <Button type="submit">Start</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SectionProps {
  section: DownloadSection;
  index: number;
  onChange: (id: string, field: keyof NewDownloadValues, value: string) => void;
  onRemove: (id: string) => void;
}

function Section({ section, index, onChange, onRemove }: SectionProps) {
  const urlInputId = `download-url-${section.id}`;
  const fileNameInputId = `download-file-name-${section.id}`;

  return (
    <FieldGroup
      className="relative rounded-lg border p-4 pt-5"
      aria-label={`Download ${index + 1}`}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="absolute -top-3 -left-3 rounded-full bg-background"
        aria-label={`Remove download ${index + 1}`}
        title="Remove section"
        onClick={() => onRemove(section.id)}
      >
        <XIcon />
      </Button>

      <Field>
        <FieldLabel htmlFor={urlInputId}>URL</FieldLabel>
        <Input
          id={urlInputId}
          name={`downloads.${index}.url`}
          type="url"
          placeholder="https://example.com/file.zip"
          value={section.url}
          onChange={(event) => onChange(section.id, "url", event.target.value)}
          required
          autoFocus={index === 0}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={fileNameInputId}>File name</FieldLabel>
        <Input
          id={fileNameInputId}
          name={`downloads.${index}.fileName`}
          type="text"
          placeholder="file.zip"
          value={section.fileName}
          onChange={(event) =>
            onChange(section.id, "fileName", event.target.value)
          }
          required
        />
      </Field>
    </FieldGroup>
  );
}
