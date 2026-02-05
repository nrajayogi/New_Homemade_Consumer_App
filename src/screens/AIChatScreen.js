import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// CONFIG: Update this URL to your server IP for physical device
const API_BASE_URL = 'http://localhost:5002';

export default function AIChatScreen({ navigation }) {
    const [messages, setMessages] = useState([
        { id: '1', text: "Hi! I'm your Homemade AI Assistant. 🥗 How can I help you eat well today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // API Call to NLP Backend
            const response = await fetch(`${API_BASE_URL}/api/nlp/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages.map(m => ({
                        role: m.sender === 'user' ? 'user' : 'assistant',
                        content: m.text
                    })),
                    context: { level: 5, points: 1250 } // Mock context
                })
            });

            const data = await response.json();

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                text: data.message || "I'm thinking...",
                sender: 'ai'
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: "Sorry, I'm having trouble connecting to my brain right now. 🧠💥",
                sender: 'ai'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                renderItem={({ item }) => (
                    <View style={[
                        styles.bubble,
                        item.sender === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            item.sender === 'user' ? styles.userText : styles.aiText
                        ]}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask about food, rewards, or eco-trips..."
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={[styles.sendButton, !input.trim() && styles.disabledButton]}
                    onPress={sendMessage}
                    disabled={!input.trim() || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Ionicons name="send" size={20} color="white" />
                    )}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white'
    },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    listContent: { padding: 16, paddingBottom: 40 },
    bubble: {
        maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12
    },
    userBubble: {
        alignSelf: 'flex-end', backgroundColor: '#FF6B6B', borderBottomRightRadius: 4
    },
    aiBubble: {
        alignSelf: 'flex-start', backgroundColor: 'white', borderBottomLeftRadius: 4,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    messageText: { fontSize: 16, lineHeight: 22 },
    userText: { color: 'white' },
    aiText: { color: '#333' },
    inputContainer: {
        flexDirection: 'row', padding: 12, backgroundColor: 'white',
        borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center'
    },
    input: {
        flex: 1, backgroundColor: '#f1f3f5', borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, marginRight: 10
    },
    sendButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B6B',
        justifyContent: 'center', alignItems: 'center'
    },
    disabledButton: { backgroundColor: '#ffcccb' }
});
