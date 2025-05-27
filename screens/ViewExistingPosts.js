import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function ViewExistingPosts() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error.message);
    } else {
      setPosts(data);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this post?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          const { error } = await supabase.from('posts').delete().eq('id', id);
          if (error) {
            Alert.alert('Error deleting', error.message);
          } else {
            setPosts((prev) => prev.filter((p) => p.id !== id));
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleSaveEdit = async () => {
    const { title, description } = editData;
    if (!title || !description) {
      Alert.alert('Missing fields', 'Title and description are required.');
      return;
    }

    const { error } = await supabase
      .from('posts')
      .update({ title, description })
      .eq('id', editingId);

    if (error) {
      Alert.alert('Error updating post', error.message);
    } else {
      setEditingId(null);
      fetchPosts();
    }
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditData({ title: post.title, description: post.description });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>View Existing Posts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {posts.map((post) => (
          <View key={post.id} style={styles.card}>
            {post.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.image} />
            )}

            {editingId === post.id ? (
              <>
                <TextInput
                  value={editData.title}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, title: text }))
                  }
                  placeholder="Title"
                  style={styles.input}
                />
                <TextInput
                  value={editData.description}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, description: text }))
                  }
                  placeholder="Description"
                  style={[styles.input, { height: 80 }]}
                  multiline
                />
                <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditingId(null)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.description}>{post.description}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.button, { flex: 1, marginRight: 10 }]}
                    onPress={() => startEdit(post)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton, { flex: 1 }]}
                    onPress={() => handleDelete(post.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
  },
  description: {
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#008080',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
