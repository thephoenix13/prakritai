import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../lib/auth-context';
import { useFamilyMembers } from '../../../lib/queries/family';
import { supabase } from '../../../lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
};

const QUICK_PROMPTS = [
  'Explain my last report',
  'Any drug interactions?',
  'What should I tell my doctor?',
  'How is my health trending?',
];

function MemberChip({ name, selected, onPress }: { name: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chips.wrap, selected && chips.wrapSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[chips.text, selected && chips.textSelected]}>{name.split(' ')[0]}</Text>
    </TouchableOpacity>
  );
}

export default function AIChat() {
  const { session, displayName } = useAuth();
  const { data: members } = useFamilyMembers();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const abortRef = useRef<AbortController | null>(null);

  const firstName = displayName?.split(' ')[0] ?? 'there';

  const selectedMember = useMemo(
    () => members?.find((m) => m.id === selectedMemberId) ?? members?.[0] ?? null,
    [members, selectedMemberId],
  );

  const welcomeText = `Hi ${firstName}! I'm Prakrit AI, your family's health assistant.${selectedMember ? ` I have context on ${selectedMember.name.split(' ')[0]}'s health records.` : ' Select a family member above for personalised answers.'} What would you like to know?`;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setInput('');

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    const assistantId = `a-${Date.now() + 1}`;
    const assistantMsg: Message = { id: assistantId, role: 'assistant', text: '', streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      abortRef.current = new AbortController();

      // Build message history for the API (last 10 exchanges)
      const history = [...messages, userMsg]
        .filter((m) => !m.streaming)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.text }));

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const token = currentSession?.access_token;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-health-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
          },
          body: JSON.stringify({
            messages: history,
            family_member_id: selectedMember?.id ?? null,
          }),
          signal: abortRef.current.signal,
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, text: "You've reached today's limit. Upgrade to Pro for unlimited questions.", streaming: false }
                : m,
            ),
          );
          return;
        }
        throw new Error(errText);
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE data lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? parsed.content ?? '';
                if (delta) {
                  accumulated += delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, text: accumulated } : m,
                    ),
                  );
                }
              } catch {
                // Non-JSON SSE line, skip
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
      );
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, text: 'Something went wrong. Please try again.', streaming: false }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [streaming, messages, selectedMember, displayName]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>P</Text>
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.headerTitle}>Prakrit AI</Text>
          <Text style={styles.headerSub}>Your family health assistant</Text>
        </View>
        {streaming && (
          <TouchableOpacity onPress={stopStreaming} style={styles.stopBtn}>
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Member chips */}
      {members && members.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberRow}
        >
          {members.map((m) => (
            <MemberChip
              key={m.id}
              name={m.name}
              selected={selectedMemberId === m.id || (!selectedMemberId && m.id === members[0].id)}
              onPress={() => setSelectedMemberId(m.id)}
            />
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Welcome message */}
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <View style={styles.aiBubbleHeader}>
              <View style={styles.aiSmallAvatar}><Text style={styles.aiSmallAvatarText}>P</Text></View>
            </View>
            <Text style={styles.messageText}>{welcomeText}</Text>
          </View>

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiBubbleHeader}>
                  <View style={styles.aiSmallAvatar}><Text style={styles.aiSmallAvatarText}>P</Text></View>
                  {msg.streaming && <ActivityIndicator size="small" color="#00B894" style={{ marginLeft: 4 }} />}
                </View>
              )}
              <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                {msg.text || (msg.streaming ? '...' : '')}
              </Text>
            </View>
          ))}

          {/* Quick prompts — shown when no messages yet */}
          {messages.length === 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestionsLabel}>Try asking:</Text>
              <View style={styles.chipRow}>
                {QUICK_PROMPTS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.chip}
                    onPress={() => sendMessage(s)}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your family's health..."
            placeholderTextColor="#A1A1AA"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          Prakrit AI is not a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const chips = StyleSheet.create({
  wrap: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  wrapSelected: { backgroundColor: '#E8FDF8', borderColor: '#CCFBF1' },
  text: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#71717A' },
  textSelected: { color: '#007A64' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
  },
  aiAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#00B894',
    alignItems: 'center', justifyContent: 'center',
  },
  aiAvatarText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#FFFFFF' },
  headerTitle: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 16, color: '#09090B' },
  headerSub: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#71717A' },
  stopBtn: {
    borderRadius: 8, borderWidth: 1, borderColor: '#E4E4E7',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  stopBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#71717A' },

  memberRow: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E4E4E7' },

  messageList: { flex: 1 },
  messageContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#09090B',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderBottomLeftRadius: 4,
    maxWidth: '90%',
  },
  aiBubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiSmallAvatar: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#00B894',
    alignItems: 'center', justifyContent: 'center',
  },
  aiSmallAvatarText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 10, color: '#FFFFFF' },

  messageText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', lineHeight: 20 },
  userMessageText: { color: '#FFFFFF' },

  suggestions: { marginTop: 8, marginBottom: 4 },
  suggestionsLabel: { fontFamily: 'Inter-Medium', fontSize: 12, color: '#71717A', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFFFFF', borderRadius: 50, borderWidth: 1, borderColor: '#E4E4E7',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  chipText: { fontFamily: 'Inter-Medium', fontSize: 13, color: '#09090B' },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    gap: 10,
  },
  input: {
    flex: 1, backgroundColor: '#F4F4F5', borderRadius: 20,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    fontFamily: 'Inter-Regular', fontSize: 14, color: '#09090B', maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#E4E4E7' },
  sendBtnText: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
  disclaimer: {
    fontFamily: 'Inter-Regular', fontSize: 10, color: '#A1A1AA',
    textAlign: 'center',
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    paddingHorizontal: 16,
  },
});
