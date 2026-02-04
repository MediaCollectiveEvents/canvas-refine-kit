import { useState, useCallback, useEffect } from "react";
import { useContent } from "../hooks/useContent";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import {
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Copy,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  contentStore,
  Project,
  Service,
  ClientLogo,
  Event,
  BlogPost,
  Page,
  Section,
  HomepageContent,
} from "../lib/contentStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDropzone } from "react-dropzone";

interface SortableSectionProps {
  section: Section;
  pageId: string;
  onEdit: (section: Section) => void;
  onToggle: (pageId: string, sectionId: string) => void;
  onDelete: (pageId: string, sectionId: string) => void;
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface ImageListProps {
  images: Array<{ id: string; url: string; alt?: string }>;
  onEdit: (image: any) => void;
  onCopy: (image: any) => void;
  onSwap: (imageId: string, direction: "up" | "down") => void;
  onDelete: (imageId: string) => void;
}

function ImageUploader({
  value,
  onChange,
  label = "Image",
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onChange(result);
        };
        reader.readAsDataURL(file);
      });
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop image here...</p>
        ) : (
          <div>
            <p className="font-medium">Drag and drop image here</p>
            <p className="text-sm text-gray-500">or click to select</p>
          </div>
        )}
      </div>

      {value && (
        <div className="relative">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function ImageList({
  images,
  onEdit,
  onCopy,
  onSwap,
  onDelete,
}: ImageListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="border rounded-lg overflow-hidden">
          <img
            src={image.url}
            alt={image.alt || "Image"}
            className="w-full h-40 object-cover"
          />
          <div className="p-3 space-y-2">
            <p className="text-sm font-medium truncate">
              {image.alt || "Untitled"}
            </p>
            <div className="flex gap-1 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(image)}
                title="Edit image"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCopy(image)}
                title="Duplicate image"
              >
                <Copy className="w-3 h-3" />
              </Button>
              {index > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSwap(image.id, "up")}
                  title="Move up"
                >
                  ↑
                </Button>
              )}
              {index < images.length - 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSwap(image.id, "down")}
                  title="Move down"
                >
                  ↓
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(image.id)}
                title="Delete image"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SortableSection({
  section,
  pageId,
  onEdit,
  onToggle,
  onDelete,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded bg-white hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        <div className="flex-1">
          <p className="font-medium">{section.title}</p>
          <p className="text-xs text-muted-foreground">
            Type: {section.type} | Order: {section.order}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggle(pageId, section.id)}
        >
          {section.enabled ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(section)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(pageId, section.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const Admin = () => {
  const { content, exportContent, importContent, resetContent } = useContent();
  const { toast } = useToast();

  const [pages, setPages] = useState<Page[]>(content.pages || []);
  const [selectedPageId, setSelectedPageId] = useState(
    (content.pages?.[0]?.id as string) || "home",
  );
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingClient, setEditingClient] = useState<ClientLogo | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [copy, setCopy] = useState<Record<string, string>>({});

  // 🔹 local homepage state so inputs are editable
  const [homepage, setHomepage] = useState<HomepageContent>(
    contentStore.getHomepage(),
  );

  useEffect(() => {
    setCopy(contentStore.getAllCopy());
    setHomepage(contentStore.getHomepage());
  }, [pages]);

  const handleCopyChange = (key: string, value: string) => {
    setCopy((prev) => ({
      ...prev,
      [key]: value,
    }));
    contentStore.updateCopy(key, value);
  };

  const handleHomepageChange = (key: keyof HomepageContent, value: any) => {
    setHomepage((prev) => ({
      ...prev,
      [key]: value,
    }));
    contentStore.updateHomepageField(key, value);
  };

  const saveHomepage = () => {
    // already synced onChange; this is mostly for UX
    toast({ title: "Saved", description: "Homepage content saved" });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const currentPage = pages.find((p) => p.id === selectedPageId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && currentPage) {
      const oldIndex = currentPage.sections.findIndex(
        (s) => s.id === active.id,
      );
      const newIndex = currentPage.sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(
        currentPage.sections,
        oldIndex,
        newIndex,
      ).map((section: Section, index: number) => ({
        ...section,
        order: index,
      }));

      const updatedPages = pages.map((p) =>
        p.id === selectedPageId ? { ...p, sections: newSections } : p,
      );

      setPages(updatedPages);
      contentStore.updatePage(selectedPageId, newSections);
      toast({
        title: "Reordered",
        description: "Sections reordered successfully",
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importContent(file);
      setPages(contentStore.getPages());
      setHomepage(contentStore.getHomepage());
      toast({
        title: "Imported",
        description: "Content imported successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to import content",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (pageId: string, sectionId: string) => {
    contentStore.toggleSection(pageId, sectionId);
    setPages(contentStore.getPages());
    toast({ title: "Updated", description: "Section visibility toggled" });
  };

  const deleteSection = (pageId: string, sectionId: string) => {
    if (!confirm("Delete this section?")) return;
    const updatedPages = pages.map((p) =>
      p.id === pageId
        ? {
            ...p,
            sections: p.sections.filter((s) => s.id !== sectionId),
          }
        : p,
    );
    setPages(updatedPages);
    contentStore.updatePage(
      pageId,
      updatedPages.find((p) => p.id === pageId)?.sections || [],
    );
    toast({ title: "Deleted", description: "Section deleted" });
  };

  const saveSection = (section: Section) => {
    if (!currentPage) return;

    const updatedPages = pages.map((p) =>
      p.id === selectedPageId
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === section.id ? section : s,
            ),
          }
        : p,
    );

    setPages(updatedPages);
    contentStore.updatePage(
      selectedPageId,
      updatedPages.find((p) => p.id === selectedPageId)?.sections || [],
    );
    toast({ title: "Saved", description: "Section data saved" });
  };

  const saveSectionData = () => {
    if (!editingSection) return;
    saveSection(editingSection);
    setEditingSection(null);
  };

  const addNewPage = (pageName: string) => {
    if (!pageName.trim()) return;

    const newPage: Page = {
      id: pageName.toLowerCase().replace(/\s+/g, "-"),
      slug: `/${pageName.toLowerCase().replace(/\s+/g, "-")}`,
      name: pageName,
      sections: [
        {
          id: contentStore.generateId(),
          type: "hero",
          title: "Hero Section",
          order: 0,
          enabled: true,
          data: {
            eyebrow: pageName,
            title: pageName,
            description: `Welcome to ${pageName}`,
            variant: "primary",
          },
        },
      ],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    contentStore.addPage(newPage);
    setSelectedPageId(newPage.id);
    toast({ title: "Created", description: `Page "${pageName}" created` });
  };

  const deletePage = (pageId: string) => {
    if (!confirm("Delete this page?")) return;
    const updatedPages = pages.filter((p) => p.id !== pageId);
    setPages(updatedPages);
    contentStore.deletePage(pageId);
    if (selectedPageId === pageId) {
      setSelectedPageId(updatedPages[0]?.id || "home");
    }
    toast({ title: "Deleted", description: "Page deleted" });
  };

  useEffect(() => {
    const nextPages = content.pages || [];
    setPages(nextPages);
    if (!nextPages.find((p) => p.id === selectedPageId)) {
      setSelectedPageId(nextPages[0]?.id || "home");
    }
  }, [content.pages, selectedPageId]);

  const [editingImage, setEditingImage] = useState<any>(null);

  const handleEditImage = (image: any) => {
    setEditingImage({ ...image });
  };

  const handleCopyImage = (image: any, sectionId: string) => {
    const projectsSection = currentPage?.sections.find(
      (s) => s.id === sectionId,
    );
    if (projectsSection && projectsSection.data.projects) {
      const newImage = {
        ...image,
        id: contentStore.generateId(),
      };
      const updated = [...projectsSection.data.projects, newImage];
      saveSection({
        ...projectsSection,
        data: { ...projectsSection.data, projects: updated },
      });
      toast({
        title: "Copied",
        description: "Image duplicated successfully",
      });
    }
  };

  const handleSwapImages = (
    imageId: string,
    direction: "up" | "down",
    items: any[],
    updateCallback: (items: any[]) => void,
  ) => {
    const index = items.findIndex((item) => item.id === imageId);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < items.length - 1)
    ) {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      const newItems = [...items];
      [newItems[index], newItems[newIndex]] = [
        newItems[newIndex],
        newItems[index],
      ];
      updateCallback(newItems);
      toast({
        title: "Reordered",
        description: "Image position updated",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Content Manager</h1>
          <p className="text-muted-foreground">
            Manage pages, sections, and content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportContent}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </Button>
          <Button variant="destructive" onClick={resetContent}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="col-span-3">
          <div className="flex flex-wrap gap-2">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant={selectedPageId === page.id ? "default" : "outline"}
                onClick={() => setSelectedPageId(page.id)}
              >
                {page.name}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              const name = prompt("Enter page name:");
              if (name) {
                addNewPage(name);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {currentPage && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{currentPage.name}</CardTitle>
                <CardDescription>
                  {currentPage.sections.length} sections
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deletePage(currentPage.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Page
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentPage.sections.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {currentPage.sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        pageId={currentPage.id}
                        onEdit={setEditingSection}
                        onToggle={toggleSection}
                        onDelete={deleteSection}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          {editingSection && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Section: {editingSection.title}</CardTitle>
                <CardDescription>Type: {editingSection.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={editingSection.title}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                {/* ... your existing section-type editors keep as-is ... */}

                <div className="flex gap-2">
                  <Button onClick={saveSectionData}>Save Section</Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="copy" className="mt-12 space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="copy">Copy</TabsTrigger>
        </TabsList>

        <TabsContent value="copy" className="space-y-4">
          {/* HOMEPAGE CONTENT EDITOR */}
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>
                Edit hero, intro and homepage sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex justify-end">
                <Button size="sm" onClick={saveHomepage}>
                  Save Homepage
                </Button>
              </div>

              {/* Hero */}
              <div>
                <Label>Hero Title</Label>
                <Input
                  value={homepage.heroTitle || ""}
                  onChange={(e) =>
                    handleHomepageChange("heroTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Hero Subtitle</Label>
                <Textarea
                  rows={3}
                  value={homepage.heroSubtitle || ""}
                  onChange={(e) =>
                    handleHomepageChange("heroSubtitle", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Hero Button Label</Label>
                <Input
                  value={homepage.heroButtonLabel || ""}
                  onChange={(e) =>
                    handleHomepageChange("heroButtonLabel", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Hero Button URL</Label>
                <Input
                  value={homepage.heroButtonUrl || ""}
                  onChange={(e) =>
                    handleHomepageChange("heroButtonUrl", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Hero Background Image</Label>
                <Input
                  value={homepage.heroImage || ""}
                  onChange={(e) =>
                    handleHomepageChange("heroImage", e.target.value)
                  }
                />
              </div>

              <hr className="my-8" />

              {/* Home Intro */}
              <div>
                <Label>Home Intro Title</Label>
                <Input
                  value={homepage.homeIntroTitle || ""}
                  onChange={(e) =>
                    handleHomepageChange("homeIntroTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Home Intro Body</Label>
                <Textarea
                  rows={6}
                  value={homepage.homeIntroBody || ""}
                  onChange={(e) =>
                    handleHomepageChange("homeIntroBody", e.target.value)
                  }
                />
              </div>

              <hr className="my-8" />

              {/* Who Attends */}
              <div>
                <Label>Who Attends Title</Label>
                <Input
                  value={homepage.whoAttendsTitle || ""}
                  onChange={(e) =>
                    handleHomepageChange("whoAttendsTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Who Attends Items (comma separated)</Label>
                <Textarea
                  rows={3}
                  value={(homepage.whoAttendsItems || []).join(", ")}
                  onChange={(e) =>
                    handleHomepageChange(
                      "whoAttendsItems",
                      e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>

              <hr className="my-8" />

              {/* Event Formats */}
              <div>
                <Label>Event Formats (JSON array)</Label>
                <Textarea
                  rows={8}
                  value={JSON.stringify(homepage.eventFormats || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleHomepageChange("eventFormats", parsed);
                    } catch {
                      // ignore until valid JSON
                    }
                  }}
                />
              </div>

              <hr className="my-8" />

              {/* Testimonials */}
              <div>
                <Label>Testimonials (JSON array)</Label>
                <Textarea
                  rows={8}
                  value={JSON.stringify(homepage.testimonials || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleHomepageChange("testimonials", parsed);
                    } catch {
                      // ignore until valid JSON
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION COPY */}
          <Card>
            <CardHeader>
              <CardTitle>Website Copy</CardTitle>
              <CardDescription>
                Edit all text content across pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(copy).map(([key, value]) => {
                const [pageId, sectionId, field] = key.split("-");
                const page = pages.find((p) => p.id === pageId);
                const section = page?.sections.find((s) => s.id === sectionId);
                return (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-semibold">
                      {page?.name} → {section?.title} → {field}
                    </Label>
                    {field === "description" ||
                    field === "bio" ||
                    field === "experience" ? (
                      <Textarea
                        value={value}
                        rows={4}
                        onChange={(e) => handleCopyChange(key, e.target.value)}
                      />
                    ) : (
                      <Input
                        value={value}
                        onChange={(e) => handleCopyChange(key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
