"use client"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dash-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Award, Calendar, ExternalLink, Upload, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '', issuer: '', issueDate: '', 
        credentialUrl: '', skills: '', type: 'Course'
    });

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            if (!token) {
                 console.warn("No auth token found, redirecting to login");
                 // router.push('/auth/login'); // Optional: redirect
                 return;
            }

            const res = await fetch('/api/certificates', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server returned ${res.status}: ${text}`);
            }

            const data = await res.json();
            if (data.success) {
                setCertificates(data.certificates);
            } else {
                console.error("API Error:", data.error);
            }
        } catch (e) {
            console.error("Failed to load certificates:", e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCertificates(); }, []);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsDialogOpen(false);
                fetchCertificates();
                setFormData({
                    title: '', issuer: '', issueDate: '', 
                    credentialUrl: '', skills: '', type: 'Course'
                });
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Failed to create certificate");
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        console.log("File selected:", file);
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('syllabus_auth_token'); 
            console.log("Uploading file...");
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            console.log("Upload response:", data);
            
            if (data.success) {
                setFormData(prev => ({ ...prev, credentialUrl: data.url }));
            } else {
                console.error("Upload failed data:", data);
                alert("Upload failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Upload error", err);
            alert("Upload failed. Check console for details.");
        } finally {
            setUploading(false);
            // Reset input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this certificate?")) return;
        try {
            const token = localStorage.getItem('syllabus_auth_token');
            const res = await fetch(`/api/certificates/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setCertificates(certificates.filter(c => c.id !== id));
            }
        } catch (e) {
            alert("Failed to delete");
        }
    };

    return (
        <DashboardLayout title="My Certificates">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8 shadow-sm">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Award className="h-40 w-40 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Award className="h-6 w-6 text-primary" />
                                Certificates & Awards
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Showcase your professional credentials and achievements.
                            </p>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <Plus className="mr-2 h-5 w-5" /> Add Certificate
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] border-border/50 bg-card/95 backdrop-blur-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-heading">Add New Certificate</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-5 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Certificate Title *</Label>
                                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AWS Certified Developer" className="bg-background/50 border-border/60 focus:bg-background" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Issuer *</Label>
                                            <Input value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} placeholder="e.g. AWS" className="bg-background/50 border-border/60 focus:bg-background" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Date *</Label>
                                            <Input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="bg-background/50 border-border/60 focus:bg-background" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Type</Label>
                                        <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                            <SelectTrigger className="bg-background/50 border-border/60 focus:bg-background"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Course">Course</SelectItem>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                                <SelectItem value="Workshop">Workshop</SelectItem>
                                                <SelectItem value="Achievement">Achievement</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Credential URL</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                value={formData.credentialUrl} 
                                                onChange={e => setFormData({...formData, credentialUrl: e.target.value})} 
                                                placeholder="https://..." 
                                                className="flex-1 bg-background/50 border-border/60 focus:bg-background"
                                            />
                                            <div className="relative w-10 h-10">
                                                <Input 
                                                    type="file" 
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
                                                    disabled={uploading}
                                                />
                                                <Button variant="outline" size="icon" type="button" disabled={uploading} className="w-full h-full bg-background/50 border-dashed border-border hover:border-primary hover:text-primary pointer-events-none">
                                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        {formData.credentialUrl && <p className="text-xs text-emerald-600 font-medium truncate flex items-center gap-1"><Medal className="w-3 h-3" /> Credential Linked</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Skills</Label>
                                        <Input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Comma separated skills..." className="bg-background/50 border-border/60 focus:bg-background" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSubmit} disabled={submitting || !formData.title || !formData.issuer} className="bg-primary hover:bg-primary/90 shadow-md">
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Certificate
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {certificates.map((cert, idx) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                    <Card className="h-full overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 group relative border-border/60">
                                        {cert.credentialUrl && cert.credentialUrl.match(/\.(jpeg|jpg|png|webp|jfif|gif)$/i) ? (
                                            <div className="h-48 w-full bg-muted flex items-center justify-center overflow-hidden border-b border-border/50 group-hover:opacity-90 transition-opacity relative">
                                                <img src={cert.credentialUrl} alt={cert.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/20">{cert.type}</Badge>
                                                </div>
                                            </div>
                                        ) : (
                                           <div className={`h-48 w-full bg-gradient-to-br ${idx % 2 === 0 ? 'from-indigo-500/10 via-purple-500/5' : 'from-emerald-500/10 via-teal-500/5'} to-background flex items-center justify-center border-b border-border/50 relative overflow-hidden`}>
                                               <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                                               <Award className={`h-20 w-20 ${idx % 2 === 0 ? 'text-indigo-500/20' : 'text-emerald-500/20'} group-hover:scale-110 transition-transform duration-500`} />
                                               <Badge variant="outline" className="absolute top-4 right-4 bg-background/50 backdrop-blur border-border/50">{cert.type}</Badge>
                                           </div>
                                        )}
                                        
                                        <CardContent className="p-6 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-heading font-bold text-lg leading-tight line-clamp-2 pr-2 group-hover:text-primary transition-colors">{cert.title}</h3>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100" onClick={() => handleDelete(cert.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm mb-4">
                                                <Medal className={`w-4 h-4 ${idx % 2 === 0 ? 'text-amber-500' : 'text-indigo-500'}`} />
                                                <span>{cert.issuer}</span>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                                {cert.credentialUrl && (
                                                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors text-primary/80">
                                                        Verify Credential <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {certificates.length === 0 && !loading && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5 animate-in fade-in zoom-in duration-500">
                                <div className="bg-background p-6 rounded-full shadow-sm mb-6">
                                    <Award className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                                <h3 className="font-heading font-bold text-2xl mb-2">No certificates yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto text-lg mb-8">
                                    Start adding your certifications, degrees, and awards to build a strong professional profile.
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)} size="lg" className="shadow-xl shadow-primary/20 h-12 px-8">
                                    Add Your First Certificate
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
