import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth-context';

export function useDocuments(familyMemberId?: string) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['documents', userId, familyMemberId ?? 'all'],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('*, family_members(name)')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (familyMemberId) {
        query = query.eq('family_member_id', familyMemberId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDocument(id: string | undefined) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['documents', userId, 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, family_members(name)')
        .eq('id', id!)
        .eq('user_id', userId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!id,
  });
}

interface UploadDocumentInput {
  uri: string;
  fileName: string;
  mimeType: string;
  familyMemberId: string;
  documentType: string;
  title: string;
  uploadSource: 'camera' | 'gallery' | 'files';
}

export function useUploadDocument() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      const { uri, fileName, mimeType, familyMemberId, documentType, title, uploadSource } = input;

      // Read the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      const ext = fileName.split('.').pop() ?? 'pdf';
      const filePath = `${userId}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, blob, { contentType: mimeType, upsert: false });
      if (storageError) throw storageError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: userId!,
          family_member_id: familyMemberId,
          title,
          document_type: documentType,
          file_url: publicUrl,
          mime_type: mimeType,
          upload_source: uploadSource,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
  });
}
