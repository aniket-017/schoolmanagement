import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import {
  List,
  FAB,
  Searchbar,
  Card,
  Title,
  Paragraph,
  Button,
  Dialog,
  Portal,
  TextInput,
  Chip,
  IconButton,
} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import { showMessage } from "react-native-flash-message";

import theme from "../../utils/theme";
import axios from "../../utils/axios";

export default function ClassManagement({ navigation }) {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get("/api/classes");
      setClasses(response.data.data);
      filterClasses(response.data.data, searchQuery);
    } catch (error) {
      showMessage({
        message: "Error fetching classes",
        description: error.response?.data?.message || "Please try again later",
        type: "danger",
      });
    }
  };

  const filterClasses = (classList, query) => {
    if (query) {
      const filtered = classList.filter(
        (cls) =>
          cls.name.toLowerCase().includes(query.toLowerCase()) ||
          cls.grade.toString().includes(query) ||
          cls.section.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classList);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterClasses(classes, query);
  };

  const handleClassPress = (cls) => {
    setSelectedClass(cls);
    setIsDialogVisible(true);
  };

  const ClassCard = ({ cls }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <Card style={styles.card} onPress={() => handleClassPress(cls)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.classInfo}>
            <View style={styles.classDetails}>
              <Title style={styles.className}>{cls.name}</Title>
              <Paragraph style={styles.classGrade}>
                Grade {cls.grade} - Section {cls.section}
              </Paragraph>
              <View style={styles.chips}>
                <Chip style={styles.chip}>{cls.students?.length || 0} Students</Chip>
                <Chip style={styles.chip}>{cls.subjects?.length || 0} Subjects</Chip>
              </View>
            </View>
          </View>
          <IconButton icon="chevron-right" size={24} iconColor={theme.colors.primary} />
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search classes..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredClasses.map((cls) => (
          <ClassCard key={cls._id} cls={cls} />
        ))}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>Class Details</Dialog.Title>
          <Dialog.Content>
            {selectedClass && (
              <>
                <Paragraph>Name: {selectedClass.name}</Paragraph>
                <Paragraph>Grade: {selectedClass.grade}</Paragraph>
                <Paragraph>Section: {selectedClass.section}</Paragraph>
                <Paragraph>Students: {selectedClass.students?.length || 0}</Paragraph>
                <Paragraph>Subjects: {selectedClass.subjects?.length || 0}</Paragraph>
                <View style={styles.dialogActions}>
                  <Button
                    mode="contained"
                    onPress={() =>
                      navigation.navigate("EditClass", {
                        classId: selectedClass._id,
                      })
                    }
                    style={styles.editButton}
                  >
                    Edit Class
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate("ClassDetails", {
                        classId: selectedClass._id,
                      })
                    }
                  >
                    View Details
                  </Button>
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("AddClass")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchBar: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classInfo: {
    flex: 1,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    ...theme.typography.subtitle1,
    marginBottom: 2,
  },
  classGrade: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  chips: {
    flexDirection: "row",
    marginTop: theme.spacing.xs,
  },
  chip: {
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  fab: {
    position: "absolute",
    margin: theme.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: theme.spacing.lg,
  },
  editButton: {
    marginRight: theme.spacing.md,
  },
});
