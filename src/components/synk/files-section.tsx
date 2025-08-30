'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FolderOpen, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  Plus,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface DriveFileItem {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'other';
  url: string;
  embedUrl: string;
}

export function FilesSection({ roomId }: { roomId: string }) {
  const [files, setFiles] = useState<DriveFileItem[]>([
    {
      id: '1',
      name: 'Sample Google Doc',
      type: 'document',
      url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      embedUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing&embedded=true'
    }
  ]);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'spreadsheet': return FileSpreadsheet;
      case 'presentation': return Presentation;
      default: return FileText;
    }
  };

  const convertToEmbedUrl = (url: string): string => {
    if (url.includes('/document/d/')) {
      const docId = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (docId) return `https://docs.google.com/document/d/${docId}/edit?usp=sharing&embedded=true`;
    }
    if (url.includes('/spreadsheets/d/')) {
      const sheetId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (sheetId) return `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing&embedded=true`;
    }
    if (url.includes('/presentation/d/')) {
      const slideId = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (slideId) return `https://docs.google.com/presentation/d/${slideId}/edit?usp=sharing&embedded=true`;
    }
    return url;
  };

  const handleAddFile = () => {
    if (!newFileName.trim() || !newFileUrl.trim()) return;
    
    const fileType = newFileUrl.includes('/document/') ? 'document' :
                    newFileUrl.includes('/spreadsheets/') ? 'spreadsheet' :
                    newFileUrl.includes('/presentation/') ? 'presentation' : 'other';
    
    const newFile: DriveFileItem = {
      id: Date.now().toString(),
      name: newFileName,
      type: fileType,
      url: newFileUrl,
      embedUrl: convertToEmbedUrl(newFileUrl)
    };
    
    setFiles([...files, newFile]);
    setNewFileName('');
    setNewFileUrl('');
    setShowAddDialog(false);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              <span>Google Drive Files</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{files.length} files</Badge>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Google Drive File</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>File Name</Label>
                      <Input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Enter display name..."
                      />
                    </div>
                    <div>
                      <Label>Google Drive URL</Label>
                      <Input
                        value={newFileUrl}
                        onChange={(e) => setNewFileUrl(e.target.value)}
                        placeholder="https://docs.google.com/..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Make sure the file is shared publicly or with link access
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddFile} disabled={!newFileName.trim() || !newFileUrl.trim()}>
                        Add File
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No files yet</h3>
              <p className="text-sm text-center mb-4 max-w-md">
                Add Google Drive files to share documents, spreadsheets, and presentations with your team.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{file.name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{file.type}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mb-3">
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Open in Drive
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setSelectedFile(file)}
                        >
                          <FileText className="h-3 w-3 mr-2" />
                          Full Screen
                        </Button>
                      </div>

                      {/* Inline Preview */}
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={file.embedUrl}
                          className="w-full h-64"
                          frameBorder="0"
                          title={file.name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Screen Preview Modal */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-6xl h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = getFileIcon(selectedFile.type);
                  return <Icon className="h-5 w-5" />;
                })()}
                {selectedFile.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedFile.embedUrl}
                className="w-full h-full border-0"
                title={selectedFile.name}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
