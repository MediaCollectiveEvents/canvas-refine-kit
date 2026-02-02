import { useState, useCallback } from "react";
import { useContent } from "../hooks/useContent";
import { Button } from "../components/ui/Button";
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
  Save,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Eye,
  EyeOff,
  Move,
  Image as ImageIcon,
  X,
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
  const { content, updateSection, exportContent, importContent, resetContent } =
    useContent();
  const { toast } = useToast();

  const [pages, setPages] = useState<Page[]>(contentStore.getPages());
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || "home");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingClient, setEditingClient] = useState<ClientLogo | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [newPageName, setNewPageName] = useState("");

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

  const saveSectionData = () => {
    if (!editingSection || !currentPage) return;

    const updatedPages = pages.map((p) =>
      p.id === selectedPageId
        ? {
            ...p,
            sections: p.sections.map((s) =>
              s.id === editingSection.id ? editingSection : s,
            ),
          }
        : p,
    );

    setPages(updatedPages);
    contentStore.updatePage(
      selectedPageId,
      updatedPages.find((p) => p.id === selectedPageId)?.sections || [],
    );
    setEditingSection(null);
    toast({ title: "Saved", description: "Section data saved" });
  };

  const addNewPage = () => {
    if (!newPageName.trim()) return;

    const newPage: Page = {
      id: newPageName.toLowerCase().replace(/\s+/g, "-"),
      slug: `/${newPageName.toLowerCase().replace(/\s+/g, "-")}`,
      name: newPageName,
      sections: [
        {
          id: contentStore.generateId(),
          type: "hero",
          title: "Hero Section",
          order: 0,
          enabled: true,
          data: {
            eyebrow: newPageName,
            title: newPageName,
            description: `Welcome to ${newPageName}`,
            variant: "primary",
          },
        },
      ],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    contentStore.addPage(newPage);
    setNewPageName("");
    setSelectedPageId(newPage.id);
    toast({ title: "Created", description: `Page "${newPageName}" created` });
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
                setNewPageName(name);
                addNewPage();
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

                {editingSection.type === "hero" && (
                  <>
                    <div>
                      <Label>Eyebrow</Label>
                      <Input
                        value={editingSection.data.eyebrow || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              eyebrow: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editingSection.data.title || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              title: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingSection.data.description || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              description: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Variant</Label>
                      <select
                        value={editingSection.data.variant || "primary"}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              variant: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="primary">Primary</option>
                        <option value="image">Image</option>
                        <option value="muted">Muted</option>
                      </select>
                    </div>
                    <div>
                      <Label>Background Image URL (optional)</Label>
                      <Input
                        value={editingSection.data.backgroundImage || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              backgroundImage: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {editingSection.type === "intro" && (
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={editingSection.data.content || ""}
                      rows={6}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          data: {
                            ...editingSection.data,
                            content: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                )}

                {editingSection.type === "about" && (
                  <>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={editingSection.data.bio || ""}
                        rows={6}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              bio: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Skills (comma separated)</Label>
                      <Input
                        value={(editingSection.data.skills || []).join(", ")}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              skills: e.target.value
                                .split(",")
                                .map((s) => s.trim()),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Textarea
                        value={editingSection.data.experience || ""}
                        rows={4}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            data: {
                              ...editingSection.data,
                              experience: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {(editingSection.type === "projects" ||
                  editingSection.type === "services" ||
                  editingSection.type === "events" ||
                  editingSection.type === "blog" ||
                  editingSection.type === "clients") && (
                  <p className="text-sm text-muted-foreground">
                    Edit individual items below using the legacy tabs interface
                  </p>
                )}

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

      <Tabs defaultValue="projects" className="mt-12 space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage portfolio projects</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingProject({
                      id: contentStore.generateId(),
                      title: "",
                      description: "",
                      imageUrl: "",
                      tags: [],
                      link: "",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPage?.sections
                  .find((s) => s.type === "projects")
                  ?.data?.projects?.map((project: Project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.description?.substring(0, 60)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {editingProject && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingProject.title}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={editingProject.imageUrl}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={editingProject.tags.join(", ")}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input
                    value={editingProject.link || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        link: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const projectsSection = currentPage?.sections.find(
                        (s) => s.type === "projects",
                      );
                      if (projectsSection) {
                        const existingProjects =
                          projectsSection.data.projects || [];
                        const updated = existingProjects.map((p: Project) =>
                          p.id === editingProject.id ? editingProject : p,
                        );
                        if (
                          !existingProjects.find(
                            (p: Project) => p.id === editingProject.id,
                          )
                        ) {
                          updated.push(editingProject);
                        }
                        setEditingSection({
                          ...projectsSection,
                          data: { ...projectsSection.data, projects: updated },
                        });
                        saveSectionData();
                      }
                      setEditingProject(null);
                    }}
                  >
                    Save Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingProject(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Manage your services</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingService({
                      id: contentStore.generateId(),
                      title: "",
                      description: "",
                      icon: "circle",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPage?.sections
                  .find((s) => s.type === "services")
                  ?.data?.services?.map((service: Service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Icon: {service.icon}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {editingService && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingService.title}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingService.description}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Icon Name (Lucide icon)</Label>
                  <Input
                    value={editingService.icon}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        icon: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const servicesSection = currentPage?.sections.find(
                        (s) => s.type === "services",
                      );
                      if (servicesSection) {
                        const existingServices =
                          servicesSection.data.services || [];
                        const updated = existingServices.map((s: Service) =>
                          s.id === editingService.id ? editingService : s,
                        );
                        if (
                          !existingServices.find(
                            (s: Service) => s.id === editingService.id,
                          )
                        ) {
                          updated.push(editingService);
                        }
                        setEditingSection({
                          ...servicesSection,
                          data: { ...servicesSection.data, services: updated },
                        });
                        saveSectionData();
                      }
                      setEditingService(null);
                    }}
                  >
                    Save Service
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingService(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Events</CardTitle>
                  <CardDescription>Manage your events</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingEvent({
                      id: contentStore.generateId(),
                      title: "",
                      description: "",
                      date: new Date().toISOString().split("T")[0],
                      location: "",
                      imageUrl: "",
                      registrationLink: "",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPage?.sections
                  .find((s) => s.type === "events")
                  ?.data?.events?.map((event: Event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.date} - {event.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {editingEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Image URL (optional)</Label>
                  <Input
                    value={editingEvent.imageUrl || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Registration Link (optional)</Label>
                  <Input
                    value={editingEvent.registrationLink || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        registrationLink: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const eventsSection = currentPage?.sections.find(
                        (s) => s.type === "events",
                      );
                      if (eventsSection) {
                        const existingEvents = eventsSection.data.events || [];
                        const updated = existingEvents.map((e: Event) =>
                          e.id === editingEvent.id ? editingEvent : e,
                        );
                        if (
                          !existingEvents.find(
                            (e: Event) => e.id === editingEvent.id,
                          )
                        ) {
                          updated.push(editingEvent);
                        }
                        setEditingSection({
                          ...eventsSection,
                          data: { ...eventsSection.data, events: updated },
                        });
                        saveSectionData();
                      }
                      setEditingEvent(null);
                    }}
                  >
                    Save Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingEvent(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>Manage your blog posts</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingBlogPost({
                      id: contentStore.generateId(),
                      title: "",
                      excerpt: "",
                      content: "",
                      author: "",
                      date: new Date().toISOString().split("T")[0],
                      imageUrl: "",
                      tags: [],
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPage?.sections
                  .find((s) => s.type === "blog")
                  ?.data?.posts?.map((post: BlogPost) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.date} - By {post.author}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBlogPost(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {editingBlogPost && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Blog Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingBlogPost.title}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    rows={3}
                    value={editingBlogPost.excerpt}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        excerpt: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    rows={10}
                    value={editingBlogPost.content}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        content: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Author</Label>
                  <Input
                    value={editingBlogPost.author}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        author: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingBlogPost.date}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Image URL (optional)</Label>
                  <Input
                    value={editingBlogPost.imageUrl || ""}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={editingBlogPost.tags.join(", ")}
                    onChange={(e) =>
                      setEditingBlogPost({
                        ...editingBlogPost,
                        tags: e.target.value.split(",").map((t) => t.trim()),
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const blogSection = currentPage?.sections.find(
                        (s) => s.type === "blog",
                      );
                      if (blogSection) {
                        const existingPosts = blogSection.data.posts || [];
                        const updated = existingPosts.map((p: BlogPost) =>
                          p.id === editingBlogPost.id ? editingBlogPost : p,
                        );
                        if (
                          !existingPosts.find(
                            (p: BlogPost) => p.id === editingBlogPost.id,
                          )
                        ) {
                          updated.push(editingBlogPost);
                        }
                        setEditingSection({
                          ...blogSection,
                          data: { ...blogSection.data, posts: updated },
                        });
                        saveSectionData();
                      }
                      setEditingBlogPost(null);
                    }}
                  >
                    Save Post
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingBlogPost(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Client Logos</CardTitle>
                  <CardDescription>Manage client logos</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingClient({
                      id: contentStore.generateId(),
                      name: "",
                      imageUrl: "",
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {currentPage?.sections
                  .find((s) => s.type === "clients")
                  ?.data?.clients?.map((client: ClientLogo) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        {client.imageUrl && (
                          <img
                            src={client.imageUrl}
                            alt={client.name}
                            className="w-12 h-12 object-contain"
                          />
                        )}
                        <p className="font-medium">{client.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingClient(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {editingClient && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Client Name</Label>
                  <Input
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={editingClient.imageUrl}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
                {editingClient.imageUrl && (
                  <div>
                    <Label>Preview</Label>
                    <img
                      src={editingClient.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-contain border p-2"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const clientsSection = currentPage?.sections.find(
                        (s) => s.type === "clients",
                      );
                      if (clientsSection) {
                        const existingClients =
                          clientsSection.data.clients || [];
                        const updated = existingClients.map((c: ClientLogo) =>
                          c.id === editingClient.id ? editingClient : c,
                        );
                        if (
                          !existingClients.find(
                            (c: ClientLogo) => c.id === editingClient.id,
                          )
                        ) {
                          updated.push(editingClient);
                        }
                        setEditingSection({
                          ...clientsSection,
                          data: { ...clientsSection.data, clients: updated },
                        });
                        saveSectionData();
                      }
                      setEditingClient(null);
                    }}
                  >
                    Save Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingClient(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
