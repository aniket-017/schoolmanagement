import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Button, ScrollView } from 'react-native';
import apiService from '../../services/apiService';

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [createForm, setCreateForm] = useState({ title: '', content: '', classId: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.announcements.getTeacherAnnouncements({ activeOnly: true, limit: 50 });
      if (response.success) {
        setAnnouncements(response.data);
      } else {
        setError(response.message || 'Failed to load announcements');
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiService.classes.getTeacherAssignedClasses();
      if (response.success) {
        setClasses(response.data || []);
      } else {
        setClasses([]);
      }
    } catch (err) {
      setClasses([]);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!createForm.title.trim() || !createForm.content.trim() || !createForm.classId) {
      setCreateError('All fields are required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        title: createForm.title,
        content: createForm.content,
        targetAudience: 'class',
        targetClasses: [createForm.classId],
        status: 'published',
      };
      const response = await apiService.announcements.createAnnouncement(payload);
      if (response.success) {
        setShowCreateModal(false);
        setCreateForm({ title: '', content: '', classId: '' });
        fetchAnnouncements();
      } else {
        setCreateError(response.message || 'Failed to create announcement');
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create announcement');
    } finally {
      setCreating(false);
    }
  };

  const renderAnnouncement = ({ item }) => (
    <TouchableOpacity onPress={() => { setSelectedAnnouncement(item); setShowDetailModal(true); }}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.title || 'Announcement'}</Text>
        <Text style={styles.snippet} numberOfLines={2}>{item.message || item.content || ''}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{item.createdBy?.name ? `By ${item.createdBy.name}` : ''}</Text>
          <Text style={styles.meta}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" /><Text>Loading announcements...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text>{error}</Text></View>
      ) : announcements.length === 0 ? (
        <View style={styles.center}><Text>No announcements found.</Text></View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderAnnouncement}
          scrollEnabled={false}
        />
      )}

      {/* Simple Create Button at bottom if teacher has classes */}
      {classes.length > 0 && !showCreateModal && (
        <View style={styles.createButtonContainer}>
          <Button title="Create Announcement" onPress={() => setShowCreateModal(true)} />
        </View>
      )}

      {/* Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.title}>{selectedAnnouncement?.title}</Text>
              <Text style={styles.meta}>{selectedAnnouncement?.createdBy?.name ? `By ${selectedAnnouncement.createdBy.name}` : ''}</Text>
              <Text style={styles.meta}>{selectedAnnouncement?.createdAt ? new Date(selectedAnnouncement.createdAt).toLocaleString() : ''}</Text>
              <Text style={styles.message}>{selectedAnnouncement?.message || selectedAnnouncement?.content}</Text>
              <Button title="Close" onPress={() => setShowDetailModal(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.title}>Create Announcement for Students</Text>
              <TextInput
                placeholder="Title"
                value={createForm.title}
                onChangeText={text => setCreateForm({ ...createForm, title: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Message"
                value={createForm.content}
                onChangeText={text => setCreateForm({ ...createForm, content: text })}
                style={[styles.input, { height: 80 }]}
                multiline
              />
              <Text style={{ marginTop: 8 }}>Select Class</Text>
              <View style={styles.selectBox}>
                {classes.length === 0 ? (
                  <Text style={{ color: 'gray' }}>No classes assigned</Text>
                ) : (
                  <>
                    {classes.map(cls => (
                      <TouchableOpacity
                        key={cls._id || cls.id}
                        style={[styles.classOption, createForm.classId === (cls._id || cls.id) && styles.classOptionSelected]}
                        onPress={() => setCreateForm({ ...createForm, classId: cls._id || cls.id })}
                      >
                        <Text style={{ color: createForm.classId === (cls._id || cls.id) ? '#fff' : '#333' }}>{cls.name || `${cls.grade}${cls.division}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
              {createError ? <Text style={{ color: 'red', marginTop: 8 }}>{createError}</Text> : null}
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <Button title="Cancel" onPress={() => setShowCreateModal(false)} />
                <View style={{ width: 16 }} />
                <Button title={creating ? 'Creating...' : 'Create'} onPress={handleCreateAnnouncement} disabled={creating} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 16, elevation: 2 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  snippet: { fontSize: 14, color: '#555', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  meta: { fontSize: 12, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, padding: 20, width: '85%' },
  message: { fontSize: 15, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 12, backgroundColor: '#f5f5f5' },
  selectBox: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  classOption: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8, backgroundColor: '#eee' },
  classOptionSelected: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  createButtonContainer: { marginTop: 24, marginBottom: 24, alignItems: 'center' },
}); 