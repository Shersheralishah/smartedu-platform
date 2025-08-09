import React, { useState, useEffect } from 'react';
import type { CourseData, ResourceData } from '@/api/course';
import { callGeminiAPI } from '@/api/gemini';

// --- Lightweight Markdown to HTML Converter ---
function simpleMarkdownToHtml(markdown: string): string {
    if (!markdown) return '';
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
}

// Define the types for the form's props
interface CourseFormProps {
  initialData?: Partial<CourseData & { thumbnailPath?: string | null }>;
  onSubmit: (data: CourseData, thumbnail: File | null, files: File[]) => void;
  onNoChanges: () => void;
  isLoading: boolean;
  submitButtonText?: string;
}

// Define client-side types with temporary IDs for React keys
type ClientResource = ResourceData & { id: number; filePath?: string | null };
type ClientModule = { id: number; title: string; resources: ClientResource[] };

let nextId = 0;

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onNoChanges,
  isLoading,
  submitButtonText = "Submit"
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<string>('');
    const [discountPercentage, setDiscountPercentage] = useState<string>('');
    const [discountedPrice, setDiscountedPrice] = useState<string>('');
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [modules, setModules] = useState<ClientModule[]>([]);
    const [resourceFiles, setResourceFiles] = useState<File[]>([]);
    const [initialStateString, setInitialStateString] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    // Effect to pre-populate the form for editing
    useEffect(() => {
        if (initialData) {
            const populatedTitle = initialData.title || '';
            const populatedDescription = initialData.description || '';
            const populatedPrice = initialData.price?.toString() || '';
            const populatedDiscount = initialData.discountPercentage?.toString() || '';

            setTitle(populatedTitle);
            setDescription(populatedDescription);
            setPrice(populatedPrice);
            setDiscountPercentage(populatedDiscount);

            if (initialData.thumbnailPath) {
                setThumbnailPreview(`http://localhost:8080/${initialData.thumbnailPath.replace(/\\/g, '/')}`);
            }
            
            const initialModules = initialData.modules?.map(m => ({
                ...m,
                id: nextId++,
                resources: m.resources.map(r => ({ ...r, id: nextId++, filePath: (r as any).filePath }))
            })) || [];
            setModules(initialModules);
            
            setInitialStateString(JSON.stringify({
                title: populatedTitle,
                description: populatedDescription,
                price: populatedPrice,
                discountPercentage: populatedDiscount,
                modules: initialModules.map(({ id, ...mod }) => ({ ...mod, resources: mod.resources.map(({ id, ...res }) => res) }))
            }));
        }
    }, [initialData]);

    // Effect for real-time price calculation
    useEffect(() => {
        const numericPrice = parseFloat(price);
        const numericDiscount = parseFloat(discountPercentage);

        if (!isNaN(numericPrice) && numericPrice > 0 && !isNaN(numericDiscount) && numericDiscount >= 0 && numericDiscount <= 100) {
            const finalPrice = numericPrice * (1 - numericDiscount / 100);
            setDiscountedPrice(finalPrice.toFixed(2));
        } else if (!isNaN(numericPrice) && numericPrice >= 0) {
            setDiscountedPrice(numericPrice.toFixed(2));
        }
        else {
            setDiscountedPrice('');
        }
    }, [price, discountPercentage]);


    // --- State Handlers ---
    const addModule = () => setModules([...modules, { id: nextId++, title: '', resources: [] }]);
    const removeModule = (id: number) => setModules(modules.filter(m => m.id !== id));
    const handleModuleChange = (id: number, title: string) => setModules(modules.map(m => (m.id === id ? { ...m, title } : m)));
    const addResource = (moduleId: number) => {
        const newResource: ClientResource = { id: nextId++, title: '', resourceType: 'PDF', estimatedTimeToCompleteMinutes: 0 };
        setModules(modules.map(m => m.id === moduleId ? { ...m, resources: [...m.resources, newResource] } : m));
    };
    const removeResource = (moduleId: number, resourceId: number) => setModules(modules.map(m => m.id === moduleId ? { ...m, resources: m.resources.filter(r => r.id !== resourceId) } : m));
    const handleResourceChange = (moduleId: number, resourceId: number, field: keyof ClientResource, value: any) => {
        setModules(modules.map(m => m.id === moduleId ? { ...m, resources: m.resources.map(r => r.id === resourceId ? { ...r, [field]: value } : r) } : m));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setResourceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };
    
    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
            setDiscountPercentage(value);
        }
    };

    const handleSetAsFree = () => {
        setPrice('0');
        setDiscountPercentage('100');
    };

    /**
     * ✅ DEFINITIVE FIX: The AI generation logic is now fully restored and intelligent.
     */
    const handleGenerateDescription = async () => {
        if (!title) {
            alert("Please enter a course title before generating a description.");
            return;
        }
        setIsGenerating(true);
        setIsPreview(false); // Switch back to write mode to see the new text
        try {
            const moduleTitles = modules.map(m => m.title).filter(t => t).join(', ');
            
            let prompt = `Generate a compelling and professional course description for a course titled "${title}".`;

            if (moduleTitles) {
                prompt += ` The course covers these topics: ${moduleTitles}.`;
            }

            if (description.trim().length > 0) {
                prompt += ` Strictly follow these additional instructions, keywords, or desired tone: "${description}".`;
            } else {
                prompt += " The description should be engaging for potential students, highlighting key learning outcomes. Keep it concise, around 2-3 paragraphs.";
            }

            prompt += " Format the final output using Markdown for bolding key terms.";
            
            const generatedDescription = await callGeminiAPI(prompt);
            if (generatedDescription) {
                setDescription(generatedDescription);
            }
        } catch (error: any) {
            alert(`Failed to generate description: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentModulesForComparison = modules.map(({ id, ...mod }) => ({ ...mod, resources: mod.resources.map(({ id, ...res }) => res) }));
        const currentStateString = JSON.stringify({ title, description, price, discountPercentage, modules: currentModulesForComparison });
        const noTextChanged = initialStateString === currentStateString;
        const noFilesChanged = !thumbnail && resourceFiles.length === 0;

        if (noTextChanged && noFilesChanged) {
            onNoChanges();
            return;
        }

        const courseData: CourseData = { 
            title, 
            description, 
            price: Number(price) || 0, 
            discountPercentage: Number(discountPercentage) || 0,
            modules: modules.map(({ id, ...rest }) => rest) 
        };
        onSubmit(courseData, thumbnail, resourceFiles);
    };

    return (
        <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Course Details Section */}
            <div className="space-y-6">
                <div>
                  <label htmlFor="course-title" className="block text-sm font-medium text-slate-700">Course Title</label>
                  <input id="course-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., The Complete Java Masterclass" />
                </div>

                <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Pricing</h3>
                        <button type="button" onClick={handleSetAsFree} className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200">Set as Free</button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="course-price" className="block text-sm font-medium text-slate-700">Original Price (INR)</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500">₹</span></div>
                                <input type="number" id="course-price" value={price} onChange={e => setPrice(e.target.value)} required className="w-full pl-7 pr-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g., 4999" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="discount-percentage" className="block text-sm font-medium text-slate-700">Discount (%)</label>
                            <div className="relative mt-1">
                                <input type="number" id="discount-percentage" value={discountPercentage} onChange={handleDiscountChange} min="0" max="100" className="w-full pr-8 pl-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g., 20" />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-slate-500">%</span></div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="discounted-price" className="block text-sm font-medium text-slate-700">Final Price</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-slate-500">₹</span></div>
                                <input type="text" id="discounted-price" value={discountedPrice} readOnly className="w-full pl-7 pr-4 py-2 border-slate-200 bg-slate-200 rounded-lg font-semibold text-slate-800" placeholder="Calculated..." />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="course-description" className="block text-sm font-medium text-slate-700">Course Description</label>
                    <div className="flex items-center space-x-4">
                        <div className="text-xs font-semibold border border-slate-200 rounded-lg p-0.5 flex">
                            <button type="button" onClick={() => setIsPreview(false)} className={`px-2 py-1 rounded-md ${!isPreview ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}>Write</button>
                            <button type="button" onClick={() => setIsPreview(true)} className={`px-2 py-1 rounded-md ${isPreview ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}>Preview</button>
                        </div>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !title} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400">
                            {isGenerating ? 'Generating...' : 'Generate with AI ✨'}
                        </button>
                    </div>
                  </div>
                  {isPreview ? (
                    <div className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 min-h-[105px] prose prose-sm" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(description) }} />
                  ) : (
                    <textarea id="course-description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Describe the course or type instructions and click 'Generate with AI'." />
                  )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Course Thumbnail</label>
                    {thumbnailPreview && (
                        <div className="mt-2 group relative">
                            <img src={thumbnailPreview} alt="Thumbnail preview" className="h-48 w-full object-cover rounded-lg shadow-inner" />
                            <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label htmlFor="thumbnail-input" className="cursor-pointer px-4 py-2 text-sm font-medium text-black bg-white bg-opacity-75 rounded-md hover:bg-opacity-100">Change Image</label>
                            </div>
                        </div>
                    )}
                    <input id="thumbnail-input" type="file" onChange={handleThumbnailChange} accept="image/*" className={`${thumbnailPreview ? 'sr-only' : 'mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100'}`}/>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800">Curriculum</h3>
                {modules.map((module, index) => (
                    <div key={module.id} className="border border-slate-200 p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <input value={module.title} onChange={e => handleModuleChange(module.id, e.target.value)} placeholder={`Module ${index + 1} Title`} className="text-lg font-semibold w-full border-b pb-1 focus:outline-none focus:border-indigo-500" />
                          <button type="button" onClick={() => removeModule(module.id)} className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                        </div>
                        <div className="pl-2 sm:pl-4 space-y-4">
                            {module.resources.map((resource) => (
                                <div key={resource.id} className="border-t pt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                      <input value={resource.title} onChange={e => handleResourceChange(module.id, resource.id, 'title', e.target.value)} placeholder="Resource Title" className="p-2 border rounded-lg w-full" />
                                      <button type="button" onClick={() => removeResource(module.id, resource.id)} className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <select value={resource.resourceType} onChange={e => handleResourceChange(module.id, resource.id, 'resourceType', e.target.value)} className="w-full p-2 border rounded-lg">
                                        <option value="PDF">PDF Document</option><option value="VIDEO">Video Link</option><option value="LINK">Article Link</option>
                                      </select>
                                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={resource.estimatedTimeToCompleteMinutes || ''} onChange={e => { if (/^\d*$/.test(e.target.value)) handleResourceChange(module.id, resource.id, 'estimatedTimeToCompleteMinutes', e.target.value === '' ? 0 : parseInt(e.target.value))}} placeholder="Time in minutes (e.g., 15)" className="w-full p-2 border rounded-lg" />
                                    </div>
                                    
                                    {resource.resourceType === 'PDF' && (
                                        <div>
                                            {resource.filePath && (
                                                <a href={`http://localhost:8080/${resource.filePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">View Current PDF</a>
                                            )}
                                            <input type="file" onChange={handleResourceFileChange} className="mt-1 w-full p-2 border rounded-lg text-sm" />
                                            <p className="mt-1 text-xs text-slate-500">Upload a new file to replace the existing one.</p>
                                        </div>
                                    )}
                                    {resource.resourceType !== 'PDF' && (
                                      <div>
                                        <input value={resource.url || ''} onChange={e => handleResourceChange(module.id, resource.id, 'url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-2 border rounded-lg" />
                                        {resource.url && <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">Test Link</a>}
                                      </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={() => addResource(module.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Add Resource</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addModule} className="w-full py-2 px-4 border border-dashed border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100">+ Add Module</button>
            </div>
            
            <div className="pt-4">
                <button type="submit" disabled={isLoading || isGenerating} className="w-full flex justify-center py-3 px-4 border-transparent text-lg font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading || isGenerating ? 'Saving...' : submitButtonText}
                </button>
            </div>
        </form>
    );
};

export default CourseForm;