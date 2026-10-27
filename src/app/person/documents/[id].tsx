import { useQuery } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionSheet } from '@/components/ui/action-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { showToast } from '@/components/ui/toast';
import {
  formatBytes,
  MAX_FILE_BYTES,
  measure,
  removeFile,
  saveAttachment,
} from '@/features/documents/files';
import { createDocument, deleteDocument, listDocuments } from '@/features/documents/repository';
import {
  buildChecklist,
  calculateDocumentationStatus,
  type DocumentType,
  type PersonDocument,
} from '@/features/documents/types';
import { getPerson } from '@/features/people/repository';

interface Picked {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  const [target, setTarget] = useState<DocumentType | null>(null);
  const [removing, setRemoving] = useState<PersonDocument | null>(null);
  const [busy, setBusy] = useState(false);

  const query = useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      const person = await getPerson(db, id);

      if (!person) {
        return null;
      }

      return { person, documents: await listDocuments(db, id) };
    },
  });

  const { refetch } = query;

  async function attach(type: DocumentType, picked: Picked) {
    if (picked.size > MAX_FILE_BYTES) {
      Alert.alert(
        'Arquivo muito grande',
        `${formatBytes(picked.size)} passa do limite de ${formatBytes(MAX_FILE_BYTES)}.`,
      );

      return;
    }

    setBusy(true);

    try {
      const uri = saveAttachment(id, picked.uri, picked.name);

      await createDocument(db, {
        personId: id,
        type,
        fileName: picked.name,
        uri,
        mimeType: picked.mimeType,
        size: picked.size || measure(uri),
      });

      await refetch();
      showToast('Documento anexado.');
    } catch (error) {
      Alert.alert('Não foi possível anexar', String(error));
    } finally {
      setBusy(false);
    }
  }

  async function fromCamera(type: DocumentType) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Câmera bloqueada', 'Libere o acesso à câmera nas configurações do aparelho.');

      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    await attach(type, {
      uri: asset.uri,
      name: asset.fileName ?? 'foto.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? measure(asset.uri),
    });
  }

  async function fromLibrary(type: DocumentType) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    await attach(type, {
      uri: asset.uri,
      name: asset.fileName ?? 'imagem.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? measure(asset.uri),
    });
  }

  async function fromFiles(type: DocumentType) {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    await attach(type, {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/pdf',
      size: asset.size ?? measure(asset.uri),
    });
  }

  async function open(document: PersonDocument) {
    try {
      const file = new File(document.uri);

      if (await file.canPreview()) {
        await file.preview({ title: document.fileName });

        return;
      }

      Alert.alert('Não foi possível abrir', 'Nenhum app do aparelho abre este arquivo.');
    } catch (error) {
      Alert.alert('Não foi possível abrir', String(error));
    }
  }

  async function confirmRemove() {
    if (!removing) {
      return;
    }

    setBusy(true);

    try {
      const uri = await deleteDocument(db, removing.id);

      if (uri) {
        removeFile(uri);
      }

      setRemoving(null);
      await refetch();
      showToast('Documento removido.');
    } catch (error) {
      Alert.alert('Não foi possível remover', String(error));
    } finally {
      setBusy(false);
    }
  }

  if (query.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-paper-50">
        <ActivityIndicator color="#163a5c" />
      </View>
    );
  }

  if (!query.data) {
    return (
      <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
        <EmptyState
          title="Cadastro não encontrado"
          message="Ele pode ter sido excluído neste aparelho."
        />
      </SafeAreaView>
    );
  }

  const { person, documents } = query.data;
  const checklist = buildChecklist(person.type, documents);
  const status = calculateDocumentationStatus(
    person.type,
    documents.map((document) => document.type),
  );

  return (
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-2">
          <Text className="font-display text-xl text-ink-900">Documentos exigidos</Text>
          <Badge label={status.label} tone={status.complete ? 'success' : 'warning'} />
        </View>

        {checklist.map((item) => (
          <View
            key={item.type}
            className="gap-3 rounded-card border border-paper-300 bg-paper-50 p-4"
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <Text className="font-body-semibold text-base text-ink-900">{item.label}</Text>
                <Text className="font-body text-sm leading-5 text-ink-400">{item.description}</Text>
              </View>
              <Badge
                label={item.fulfilled ? 'Enviado' : 'Faltando'}
                tone={item.fulfilled ? 'success' : 'warning'}
              />
            </View>

            {item.attachments.map((attachment) => (
              <View
                key={attachment.id}
                className="flex-row items-center gap-3 border-t border-paper-200 pt-3"
              >
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 gap-0.5"
                  onPress={() => void open(attachment)}
                >
                  <Text className="font-body-medium text-sm text-accent-700" numberOfLines={1}>
                    {attachment.fileName}
                  </Text>
                  <Text className="font-body text-xs text-ink-400">
                    {formatBytes(attachment.size)}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${attachment.fileName}`}
                  onPress={() => setRemoving(attachment)}
                  className="rounded-field border border-paper-300 px-3 py-1.5 active:bg-paper-100"
                >
                  <Text className="font-body-medium text-sm text-brick-700">Remover</Text>
                </Pressable>
              </View>
            ))}

            <Button
              label={item.fulfilled ? 'Anexar outro' : 'Anexar'}
              variant="secondary"
              disabled={busy}
              onPress={() => setTarget(item.type)}
            />
          </View>
        ))}
      </ScrollView>

      <ActionSheet
        visible={target !== null}
        title="Anexar documento"
        onClose={() => setTarget(null)}
        options={
          target
            ? [
                {
                  label: 'Tirar foto',
                  description: 'Abre a câmera do aparelho',
                  onPress: () => void fromCamera(target),
                },
                {
                  label: 'Escolher da galeria',
                  description: 'Imagem já salva no aparelho',
                  onPress: () => void fromLibrary(target),
                },
                {
                  label: 'Escolher um PDF',
                  description: 'Arquivo dos seus documentos',
                  onPress: () => void fromFiles(target),
                },
              ]
            : []
        }
      />

      <ConfirmDialog
        visible={removing !== null}
        title="Remover este documento?"
        message={`${removing?.fileName ?? ''} sai do cadastro e o arquivo é apagado do aparelho.`}
        confirmLabel={busy ? 'Removendo...' : 'Remover'}
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoving(null)}
      />
    </SafeAreaView>
  );
}
