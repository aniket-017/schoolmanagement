import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Copy,
  X
} from "lucide-react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [groupedExams, setGroupedExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [editingMode, setEditingMode] = useState(''); // 'group' or 'instance'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [examInstances, setExamInstances] = useState([]);
  const [expandedExams, setExpandedExams] = useState(new Set());
  const [useGroupedView, setUseGroupedView] = useState(true);

  // Form state for creating/editing exams
  const [examForm, setExamForm] = useState({
    name: "",
    type: "unit_test",
    classId: "",
    selectedClasses: [], // For multiple class selection
    subjectId: "",
    academicYear: "2024-25",
    semester: "",
    examDate: "",
    startTime: "",
    endTime: "",
    duration: "",
    venue: "",
    totalMarks: "",
    passingMarks: "",
    instructions: "",
    syllabus: "",
    allowedMaterials: [],
    invigilators: []
  });

  // Handle class selection change
  const handleClassChange = (classId) => {
    setExamForm({...examForm, classId, subjectId: ""});
  };

  // Handle multiple class selection
  const handleMultipleClassChange = (classId, isChecked) => {
    let updatedClasses;
    if (isChecked) {
      updatedClasses = [...examForm.selectedClasses, classId];
    } else {
      updatedClasses = examForm.selectedClasses.filter(id => id !== classId);
    }
    setExamForm({...examForm, selectedClasses: updatedClasses});
  };

  // Toggle all classes selection
  const toggleAllClasses = () => {
    if (examForm.selectedClasses.length === classes.length) {
      setExamForm({...examForm, selectedClasses: []});
    } else {
      setExamForm({...examForm, selectedClasses: classes.map(cls => cls._id)});
    }
  };

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [useGroupedView]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      if (useGroupedView) {
        const data = await apiService.examinations.getGrouped();
        setGroupedExams(data.data || []);
      } else {
        const data = await apiService.examinations.getAll();
        setExams(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await apiService.classes.getAll();
      setClasses(data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await apiService.subjects.getAll();
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Toggle expanded state for exam groups
  const toggleExpanded = (examName) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examName)) {
      newExpanded.delete(examName);
    } else {
      newExpanded.add(examName);
    }
    setExpandedExams(newExpanded);
  };

  // Add exam instance to the list
  const addExamInstance = () => {
    // Check if we have at least a class selected
    const hasClass = examForm.selectedClasses.length > 0 || examForm.classId;
    
    if (!hasClass) {
      toast.error("Please select a class before adding an instance");
      return;
    }

    // Validate required fields before creating instance
    if (!examForm.subjectId) {
      toast.error("Please select a subject before adding an instance");
      return;
    }
    
    // Use default values if not provided in main form
    const defaultDate = examForm.examDate || new Date().toISOString().split('T')[0];
    const defaultStartTime = examForm.startTime || '09:00';
    const defaultEndTime = examForm.endTime || '11:00';

    // If multiple classes are selected, create an instance for each class
    if (examForm.selectedClasses.length > 0) {
      const newInstances = examForm.selectedClasses.map(classId => {
        const classInfo = classes.find(c => c._id === classId);
        return {
          id: Date.now() + Math.random(), // Unique ID for each instance
          classId: classId,
          subjectId: examForm.subjectId,
          examDate: defaultDate,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          duration: examForm.duration || 120,
          venue: examForm.venue || "",
          className: classInfo?.name || "Unknown Class",
          classDivision: classInfo?.division || "",
          subjectName: subjects.find(s => s._id === examForm.subjectId)?.name || "Unknown Subject"
        };
      });
      
      setExamInstances([...examInstances, ...newInstances]);
    } else {
      // Single class instance
      const newInstance = {
        id: Date.now(),
        classId: examForm.classId,
        subjectId: examForm.subjectId,
        examDate: defaultDate,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        duration: examForm.duration || 120,
        venue: examForm.venue || "",
        className: classes.find(c => c._id === examForm.classId)?.name || "Unknown Class",
        classDivision: classes.find(c => c._id === examForm.classId)?.division || "",
        subjectName: subjects.find(s => s._id === examForm.subjectId)?.name || "Unknown Subject"
      };

      setExamInstances([...examInstances, newInstance]);
    }
    
    // Don't reset the form fields - keep them for the next instance
    // Only clear the selected classes to avoid duplicates
    setExamForm({
      ...examForm,
      selectedClasses: []
    });
  };

  // Duplicate exam instance
  const duplicateExamInstance = (instanceToDuplicate) => {
    const newInstance = {
      ...instanceToDuplicate,
      id: Date.now(),
      examDate: "",
      startTime: "",
      endTime: "",
      venue: ""
    };
    setExamInstances([...examInstances, newInstance]);
  };

  // Handle edit exam group
  const handleEditExamGroup = (examGroup) => {
    setSelectedExam(examGroup);
    setEditingMode('group');
    
    // Populate form with group data
    setExamForm({
      name: examGroup.examName,
      type: examGroup.examType,
      classId: "",
      subjectId: "",
      academicYear: examGroup.academicYear || "2024-25",
      semester: examGroup.semester,
      examDate: "",
      startTime: "",
      endTime: "",
      duration: "",
      venue: "",
      totalMarks: examGroup.totalMarks,
      passingMarks: examGroup.passingMarks,
      instructions: examGroup.instructions,
      syllabus: examGroup.syllabus,
      allowedMaterials: examGroup.allowedMaterials || [],
      invigilators: []
    });
    
    setShowEditModal(true);
  };

  // Handle edit individual instance
  const handleEditInstance = (instance) => {
    setSelectedExam(instance);
    setEditingMode('instance');
    
    // Populate form with instance data
    setExamForm({
      name: instance.name || "",
      type: instance.type || "unit_test",
      classId: instance.classId || "",
      subjectId: instance.subjectId || "",
      academicYear: instance.academicYear || "2024-25",
      semester: instance.semester || "",
      examDate: instance.examDate ? new Date(instance.examDate).toISOString().split('T')[0] : "",
      startTime: instance.startTime || "",
      endTime: instance.endTime || "",
      duration: instance.duration || "",
      venue: instance.venue || "",
      totalMarks: instance.totalMarks || "",
      passingMarks: instance.passingMarks || "",
      instructions: instance.instructions || "",
      syllabus: instance.syllabus || "",
      allowedMaterials: instance.allowedMaterials || [],
      invigilators: instance.invigilators || []
    });
    
    setShowEditModal(true);
  };

  // Handle update exam
  const handleUpdateExam = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingMode === 'group') {
        // Update all instances in the group
        const updatePromises = selectedExam.instances.map(instance => {
          const updateData = {
            name: examForm.name || selectedExam.examName,
            type: examForm.type || selectedExam.examType,
            totalMarks: examForm.totalMarks || selectedExam.totalMarks,
            passingMarks: examForm.passingMarks || selectedExam.passingMarks,
            instructions: examForm.instructions || selectedExam.instructions,
            syllabus: examForm.syllabus || selectedExam.syllabus,
            academicYear: examForm.academicYear || selectedExam.academicYear,
            semester: examForm.semester || selectedExam.semester
          };
          return apiService.examinations.update(instance._id, updateData);
        });
        
        await Promise.all(updatePromises);
        toast.success(`Updated ${selectedExam.instances.length} exam instances successfully!`);
      } else {
        // Update individual instance
        const updateData = {
          name: examForm.name || selectedExam.name,
          type: examForm.type || selectedExam.type,
          classId: examForm.classId || selectedExam.classId,
          subjectId: examForm.subjectId || selectedExam.subjectId,
          examDate: examForm.examDate || selectedExam.examDate,
          startTime: examForm.startTime || selectedExam.startTime,
          endTime: examForm.endTime || selectedExam.endTime,
          duration: examForm.duration || selectedExam.duration,
          venue: examForm.venue || selectedExam.venue,
          totalMarks: examForm.totalMarks || selectedExam.totalMarks,
          passingMarks: examForm.passingMarks || selectedExam.passingMarks,
          instructions: examForm.instructions || selectedExam.instructions,
          syllabus: examForm.syllabus || selectedExam.syllabus,
          academicYear: examForm.academicYear || selectedExam.academicYear,
          semester: examForm.semester || selectedExam.semester
        };
        
        await apiService.examinations.update(selectedExam._id, updateData);
        toast.success("Exam updated successfully!");
      }
      
      setShowEditModal(false);
      resetForm();
      fetchExams();
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  // Remove exam instance
  const removeExamInstance = (instanceId) => {
    setExamInstances(examInstances.filter(instance => instance.id !== instanceId));
  };

  // Update exam instance
  const updateExamInstance = (instanceId, updatedData) => {
    setExamInstances(examInstances.map(instance => 
      instance.id === instanceId 
        ? { ...instance, ...updatedData }
        : instance
    ));
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Exam instances count:", examInstances.length);
    console.log("Exam instances data:", examInstances);
    console.log("Form data:", examForm);
    console.log("Classes available:", classes.length);
    console.log("Subjects available:", subjects.length);
    
    // Check if we have classes and subjects available
    if (classes.length === 0 || subjects.length === 0) {
      toast.error("No classes or subjects available. Please add classes and subjects first.");
      return;
    }

    // Validate main form fields that are always required
    if (!examForm.name) {
      toast.error("Exam name is required");
      return;
    }
    if (!examForm.type) {
      toast.error("Exam type is required");
      return;
    }
    if (!examForm.totalMarks) {
      toast.error("Total marks is required");
      return;
    }

    // Validate marks
    if (isNaN(examForm.totalMarks) || examForm.totalMarks <= 0) {
      toast.error("Total marks must be a positive number");
      return;
    }

    if (examForm.passingMarks && (isNaN(examForm.passingMarks) || examForm.passingMarks < 0 || examForm.passingMarks > examForm.totalMarks)) {
      toast.error("Passing marks must be between 0 and total marks");
      return;
    }

    // Check if we have exam instances to create
    if (examInstances.length > 0) {
      console.log("=== VALIDATING EXAM INSTANCES ===");
      // Validate exam instances
      const invalidInstances = [];
      
      examInstances.forEach((instance, index) => {
        console.log(`Validating instance ${index + 1}:`, instance);
        const instanceErrors = [];
        
        if (!instance.classId) {
          instanceErrors.push("Class");
        }
        if (!instance.subjectId) {
          instanceErrors.push("Subject");
        }
        if (!instance.examDate) {
          instanceErrors.push("Date");
        }
        if (!instance.startTime) {
          instanceErrors.push("Start Time");
        }
        if (!instance.endTime) {
          instanceErrors.push("End Time");
        }
        
        if (instanceErrors.length > 0) {
          invalidInstances.push(`Instance ${index + 1}: ${instanceErrors.join(", ")}`);
        }
      });
      
      console.log("Invalid instances:", invalidInstances);
      
      if (invalidInstances.length > 0) {
        toast.error(`Please fill required fields: ${invalidInstances.join("; ")}`);
        return;
      }

      // Validate time logic for instances
      for (let i = 0; i < examInstances.length; i++) {
        const instance = examInstances[i];
        if (instance.startTime && instance.endTime) {
          const startTimeMinutes = parseInt(instance.startTime.split(':')[0]) * 60 + parseInt(instance.startTime.split(':')[1]);
          const endTimeMinutes = parseInt(instance.endTime.split(':')[0]) * 60 + parseInt(instance.endTime.split(':')[1]);
          
          if (endTimeMinutes <= startTimeMinutes) {
            toast.error(`Instance ${i + 1}: End time must be after start time`);
            return;
          }
        }
      }
      
      console.log("=== ALL VALIDATIONS PASSED - PROCEEDING TO CREATE EXAMS ===");
      
      // Proceed with creating exams from instances
      try {
        setLoading(true);
        
        const examPromises = examInstances.map(instance => {
          const examData = {
            name: examForm.name,
            type: examForm.type,
            classId: instance.classId,
            subjectId: instance.subjectId,
            academicYear: examForm.academicYear || "2024-25",
            semester: examForm.semester || "",
            examDate: instance.examDate,
            startTime: instance.startTime,
            endTime: instance.endTime,
            duration: instance.duration || 120,
            venue: instance.venue || "",
            totalMarks: examForm.totalMarks,
            passingMarks: examForm.passingMarks || 40,
            instructions: examForm.instructions || "",
            syllabus: examForm.syllabus || "",
            allowedMaterials: examForm.allowedMaterials || [],
            invigilators: examForm.invigilators || [],
            status: "scheduled"
          };
          console.log("Creating exam with data:", examData);
          return apiService.examinations.create(examData);
        });

        await Promise.all(examPromises);
        
        toast.success(`${examInstances.length} exam(s) created successfully!`);
        setShowCreateModal(false);
        resetForm();
        setExamInstances([]);
        fetchExams();
      } catch (error) {
        console.error("Error creating exams:", error);
        toast.error("Failed to create exams");
      } finally {
        setLoading(false);
      }
      return;
    } else {
      // Validate required fields for single exam creation
      // Check if we have either a single class or multiple classes selected
      const hasClass = examForm.classId || examForm.selectedClasses.length > 0;
      
      if (!hasClass) {
        toast.error("Please select at least one class");
        return;
      }

      if (!examForm.subjectId) {
        toast.error("Please select a subject");
        return;
      }

      if (!examForm.examDate) {
        toast.error("Please select an exam date");
        return;
      }

      if (!examForm.startTime) {
        toast.error("Please select a start time");
        return;
      }

      if (!examForm.endTime) {
        toast.error("Please select an end time");
        return;
      }

      // Validate time for single exam
      if (examForm.startTime && examForm.endTime) {
        const startTimeMinutes = parseInt(examForm.startTime.split(':')[0]) * 60 + parseInt(examForm.startTime.split(':')[1]);
        const endTimeMinutes = parseInt(examForm.endTime.split(':')[0]) * 60 + parseInt(examForm.endTime.split(':')[1]);
        
        if (endTimeMinutes <= startTimeMinutes) {
          toast.error("End time must be after start time");
          return;
        }
      }
      
      // Create exam(s) - handle both single class and multiple classes
      try {
        setLoading(true);
        
        // If multiple classes are selected, create an exam for each class
        if (examForm.selectedClasses.length > 0) {
          const examPromises = examForm.selectedClasses.map(classId => {
            const examData = {
              name: examForm.name,
              type: examForm.type,
              classId: classId,
              subjectId: examForm.subjectId,
              academicYear: examForm.academicYear || "2024-25",
              semester: examForm.semester || "",
              examDate: examForm.examDate,
              startTime: examForm.startTime,
              endTime: examForm.endTime,
              duration: examForm.duration || 120,
              venue: examForm.venue || "",
              totalMarks: examForm.totalMarks,
              passingMarks: examForm.passingMarks || 40,
              instructions: examForm.instructions || "",
              syllabus: examForm.syllabus || "",
              allowedMaterials: examForm.allowedMaterials || [],
              invigilators: examForm.invigilators || [],
              status: "scheduled"
            };
            console.log("Creating exam for class:", classId, "with data:", examData);
            return apiService.examinations.create(examData);
          });

          await Promise.all(examPromises);
          toast.success(`${examForm.selectedClasses.length} exam(s) created successfully!`);
        } else {
          // Single class exam
          const examData = {
            name: examForm.name,
            type: examForm.type,
            classId: examForm.classId,
            subjectId: examForm.subjectId,
            academicYear: examForm.academicYear || "2024-25",
            semester: examForm.semester || "",
            examDate: examForm.examDate,
            startTime: examForm.startTime,
            endTime: examForm.endTime,
            duration: examForm.duration || 120,
            venue: examForm.venue || "",
            totalMarks: examForm.totalMarks,
            passingMarks: examForm.passingMarks || 40,
            instructions: examForm.instructions || "",
            syllabus: examForm.syllabus || "",
            allowedMaterials: examForm.allowedMaterials || [],
            invigilators: examForm.invigilators || [],
            status: "scheduled"
          };
          
          console.log("Creating single exam with data:", examData);
          await apiService.examinations.create(examData);
          toast.success("Exam created successfully!");
        }
        
        setShowCreateModal(false);
        resetForm();
        fetchExams();
      } catch (error) {
        console.error("Error creating exam:", error);
        toast.error("Failed to create exam");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setExamForm({
      name: "",
      type: "unit_test",
      classId: "",
      selectedClasses: [],
      subjectId: "",
      academicYear: "2024-25",
      semester: "",
      examDate: "",
      startTime: "",
      endTime: "",
      duration: "",
      venue: "",
      totalMarks: "",
      passingMarks: "",
      instructions: "",
      syllabus: "",
      allowedMaterials: [],
      invigilators: []
    });
    setExamInstances([]);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await apiService.examinations.delete(examId);
        toast.success("Exam deleted successfully!");
        fetchExams();
      } catch (error) {
        console.error("Error deleting exam:", error);
        toast.error("Failed to delete exam");
      }
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || exam.classId === filterClass;
    const matchesStatus = !filterStatus || exam.status === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const filteredGroupedExams = groupedExams.filter(examGroup => {
    const matchesSearch = examGroup.examName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         examGroup.examType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if any instance matches the class filter
    const matchesClass = !filterClass || examGroup.instances.some(instance => 
      instance.classId === filterClass
    );
    
    // Check if any instance matches the status filter
    const matchesStatus = !filterStatus || examGroup.statuses.includes(filterStatus);
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "ongoing": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "unit_test": return "bg-purple-100 text-purple-800";
      case "midterm": return "bg-orange-100 text-orange-800";
      case "final": return "bg-red-100 text-red-800";
      case "practical": return "bg-green-100 text-green-800";
      case "project": return "bg-indigo-100 text-indigo-800";
      case "assignment": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Management</h1>
          <p className="text-gray-600">Create and manage examinations for all classes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {useGroupedView ? "Exam Groups" : "Total Exams"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {useGroupedView ? groupedExams.length : exams.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {useGroupedView 
                    ? groupedExams.filter(e => e.statuses.includes("scheduled")).length
                    : exams.filter(e => e.status === "scheduled").length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {useGroupedView 
                    ? groupedExams.filter(e => e.statuses.includes("ongoing")).length
                    : exams.filter(e => e.status === "ongoing").length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setUseGroupedView(!useGroupedView)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  useGroupedView 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                {useGroupedView ? 'Grouped View' : 'Individual View'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Exam
              </button>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Exams Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {useGroupedView ? "Instances" : "Class & Subject"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading exams...
                    </td>
                  </tr>
                ) : (useGroupedView ? filteredGroupedExams : filteredExams).length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No exams found
                    </td>
                  </tr>
                ) : useGroupedView ? (
                  filteredGroupedExams.map((examGroup) => (
                    <React.Fragment key={examGroup._id}>
                      {/* Main exam group row */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleExpanded(examGroup.examName)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedExams.has(examGroup.examName) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{examGroup.examName}</div>
                              <div className="text-sm text-gray-500">{examGroup.examType}</div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(examGroup.examType)}`}>
                                {examGroup.examType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {examGroup.instanceCount} instance{examGroup.instanceCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Set(examGroup.instances.map(i => i.classInfo?.name)).size} class{new Set(examGroup.instances.map(i => i.classInfo?.name)).size !== 1 ? 'es' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(examGroup.earliestDate).toLocaleDateString()}
                            {examGroup.earliestDate !== examGroup.latestDate && (
                              <span className="text-gray-500"> - {new Date(examGroup.latestDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {examGroup.instances.length} session{examGroup.instances.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {examGroup.statuses.map((status) => (
                              <span key={status} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedExam(examGroup);
                                setShowViewModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditExamGroup(examGroup)}
                              className="text-green-600 hover:text-green-900" 
                              title="Edit Exam Group"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete all instances of "${examGroup.examName}"?`)) {
                                  examGroup.instances.forEach(instance => handleDeleteExam(instance._id));
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete All Instances"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded instances */}
                      {expandedExams.has(examGroup.examName) && (
                        <>
                          {examGroup.instances.map((instance, index) => (
                            <tr key={instance._id} className="bg-gray-50 border-l-4 border-blue-200">
                              <td className="px-6 py-3 pl-12">
                                <div className="text-sm text-gray-600">
                                  Instance {index + 1}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm text-gray-900">
                                  {instance.classInfo?.name || "N/A"}
                                  {instance.classInfo?.division && (
                                    <span className="text-gray-500 ml-1">({instance.classInfo.division})</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {instance.subjectInfo?.name || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-sm text-gray-900">
                                  {new Date(instance.examDate).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {instance.startTime} - {instance.endTime}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {instance.venue && `Venue: ${instance.venue}`}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                                  {instance.status}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedExam(instance);
                                      setShowViewModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="View Instance"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleEditInstance(instance)}
                                    className="text-green-600 hover:text-green-900" 
                                    title="Edit Instance"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExam(instance._id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete Instance"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                          <div className="text-sm text-gray-500">{exam.type}</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(exam.type)}`}>
                            {exam.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {exam.classId?.name || "N/A"}
                          {exam.classId?.division && (
                            <span className="text-gray-500 ml-1">({exam.classId.division})</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.subjectId?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(exam.examDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.startTime} - {exam.endTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exam.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedExam(exam);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditInstance(exam)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Exam"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Exam</h2>
            </div>
            
            <form onSubmit={handleCreateExam} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter exam name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={examForm.type}
                    onChange={(e) => setExamForm({...examForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Exam Type</option>
                    <option value="unit_test">Unit Test</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="practical">Practical</option>
                    <option value="project">Project</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classes <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                      <input
                        type="checkbox"
                        id="selectAllClasses"
                        checked={examForm.selectedClasses.length === classes.length && classes.length > 0}
                        onChange={toggleAllClasses}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="selectAllClasses" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Select All Classes
                      </label>
                    </div>
                    <div className="space-y-2">
                      {classes.map((cls) => (
                        <div key={cls._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`class-${cls._id}`}
                            checked={examForm.selectedClasses.includes(cls._id)}
                            onChange={(e) => handleMultipleClassChange(cls._id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`class-${cls._id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                            {cls.name}
                            {cls.division && (
                              <span className="text-gray-500 ml-1">({cls.division})</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                    {examForm.selectedClasses.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-blue-600">
                          {examForm.selectedClasses.length} class{examForm.selectedClasses.length !== 1 ? 'es' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={examForm.subjectId}
                    onChange={(e) => setExamForm({...examForm, subjectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={examForm.academicYear}
                    onChange={(e) => setExamForm({...examForm, academicYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2024-25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={examForm.semester}
                    onChange={(e) => setExamForm({...examForm, semester: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., First Semester"
                  />
                </div>

                {/* Scheduling */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({...examForm, examDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={examForm.startTime}
                    onChange={(e) => setExamForm({...examForm, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={examForm.endTime}
                    onChange={(e) => setExamForm({...examForm, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={examForm.venue}
                    onChange={(e) => setExamForm({...examForm, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Room number or location"
                  />
                </div>

                {/* Marks */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Marks & Instructions</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({...examForm, totalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={examForm.passingMarks}
                    onChange={(e) => setExamForm({...examForm, passingMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={examForm.instructions}
                    onChange={(e) => setExamForm({...examForm, instructions: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Exam instructions for students..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syllabus Coverage
                  </label>
                  <textarea
                    value={examForm.syllabus}
                    onChange={(e) => setExamForm({...examForm, syllabus: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Topics covered in this exam..."
                  />
                </div>
              </div>

              {/* Exam Instances Section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Instances</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add multiple exam instances with different dates, times, and venues for the same exam.
                </p>

                {/* Add Instance Button */}
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={addExamInstance}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exam Instance
                  </button>
                  {examInstances.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExamInstances([])}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear All Instances
                    </button>
                  )}
                </div>

                {/* Exam Instances List */}
                {examInstances.length > 0 && (
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Added Instances ({examInstances.length})</h4>
                      <div className="text-sm text-gray-500">
                        {examInstances.length} exam{examInstances.length !== 1 ? 's' : ''} will be created
                      </div>
                    </div>
                    {examInstances.map((instance, index) => (
                      <div key={instance.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Instance {index + 1}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Class:</span>
                                <p className="text-gray-900">
                                  {instance.className}
                                  {instance.classDivision && (
                                    <span className="text-gray-500 ml-1">({instance.classDivision})</span>
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Subject:</span>
                                <p className="text-gray-900">{instance.subjectName}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Date:</span>
                                {instance.examDate ? (
                                  <p className="text-gray-900">
                                    {new Date(instance.examDate).toLocaleDateString()}
                                  </p>
                                ) : (
                                  <input
                                    type="date"
                                    value={instance.examDate || ''}
                                    onChange={(e) => updateExamInstance(instance.id, { examDate: e.target.value })}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  />
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Time:</span>
                                {instance.startTime && instance.endTime ? (
                                  <p className="text-gray-900">
                                    {`${instance.startTime} - ${instance.endTime}`}
                                  </p>
                                ) : (
                                  <div className="flex gap-1">
                                    <input
                                      type="time"
                                      value={instance.startTime || ''}
                                      onChange={(e) => updateExamInstance(instance.id, { startTime: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Start"
                                    />
                                    <input
                                      type="time"
                                      value={instance.endTime || ''}
                                      onChange={(e) => updateExamInstance(instance.id, { endTime: e.target.value })}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="End"
                                    />
                                  </div>
                                )}
                              </div>
                              {instance.venue && (
                                <div className="md:col-span-2">
                                  <span className="font-medium text-gray-700">Venue:</span>
                                  <p className="text-gray-900">{instance.venue}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              type="button"
                              onClick={() => duplicateExamInstance(instance)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Duplicate this instance"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExamInstance(instance.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove this instance"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : examInstances.length > 0 ? `Create ${examInstances.length} Exam${examInstances.length !== 1 ? 's' : ''}` : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Exam Modal */}
      {showViewModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedExam.instances ? "Exam Group Details" : "Exam Details"}
              </h2>
            </div>
            
            <div className="p-6">
              {/* Check if it's a grouped exam or individual exam */}
              {selectedExam.instances ? (
                // Grouped Exam View
                <div>
                  {/* Group Information */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">Exam Group Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Exam Name</label>
                        <p className="text-sm text-blue-900 font-medium">{selectedExam.examName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Type</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedExam.examType)}`}>
                          {selectedExam.examType}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Total Instances</label>
                        <p className="text-sm text-blue-900">{selectedExam.instanceCount}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Date Range</label>
                        <p className="text-sm text-blue-900">
                          {new Date(selectedExam.earliestDate).toLocaleDateString()} - {new Date(selectedExam.latestDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Total Marks</label>
                        <p className="text-sm text-blue-900">{selectedExam.totalMarks}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Passing Marks</label>
                        <p className="text-sm text-blue-900">{selectedExam.passingMarks}</p>
                      </div>
                    </div>
                    {selectedExam.instructions && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-blue-700 mb-1">Instructions</label>
                        <p className="text-sm text-blue-900">{selectedExam.instructions}</p>
                      </div>
                    )}
                    {selectedExam.syllabus && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-blue-700 mb-1">Syllabus Coverage</label>
                        <p className="text-sm text-blue-900">{selectedExam.syllabus}</p>
                      </div>
                    )}
                  </div>

                  {/* Individual Instances */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">All Exam Instances ({selectedExam.instances.length})</h3>
                    <div className="space-y-4">
                      {selectedExam.instances.map((instance, index) => (
                        <div key={instance._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Instance {index + 1}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                              {instance.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Class:</span>
                              <p className="text-gray-900">
                                {instance.classInfo?.name || "N/A"}
                                {instance.classInfo?.division && (
                                  <span className="text-gray-500 ml-1">({instance.classInfo.division})</span>
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Subject:</span>
                              <p className="text-gray-900">{instance.subjectInfo?.name || "N/A"}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Date:</span>
                              <p className="text-gray-900">{new Date(instance.examDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Time:</span>
                              <p className="text-gray-900">{instance.startTime} - {instance.endTime}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Duration:</span>
                              <p className="text-gray-900">{instance.duration} minutes</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Venue:</span>
                              <p className="text-gray-900">{instance.venue || "Not specified"}</p>
                            </div>
                          </div>
                          {instance.invigilatorInfo && instance.invigilatorInfo.length > 0 && (
                            <div className="mt-3">
                              <span className="font-medium text-gray-700 text-sm">Invigilators:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {instance.invigilatorInfo.map((invigilator, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {invigilator.firstName} {invigilator.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Individual Exam View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                    <p className="text-sm text-gray-900">{selectedExam.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedExam.type)}`}>
                      {selectedExam.type}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <p className="text-sm text-gray-900">
                      {selectedExam.classId?.name || "N/A"}
                      {selectedExam.classId?.division && (
                        <span className="text-gray-500 ml-1">({selectedExam.classId.division})</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-sm text-gray-900">{selectedExam.subjectId?.name || "N/A"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedExam.examDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <p className="text-sm text-gray-900">
                      {selectedExam.startTime} - {selectedExam.endTime}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <p className="text-sm text-gray-900">{selectedExam.duration} minutes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <p className="text-sm text-gray-900">{selectedExam.venue || "Not specified"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <p className="text-sm text-gray-900">{selectedExam.totalMarks}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                    <p className="text-sm text-gray-900">{selectedExam.passingMarks}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <p className="text-sm text-gray-900">{selectedExam.instructions || "No instructions provided"}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Syllabus</label>
                    <p className="text-sm text-gray-900">{selectedExam.syllabus || "No syllabus specified"}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMode === 'group' ? 'Edit Exam Group' : 'Edit Exam Instance'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {editingMode === 'group' 
                  ? `Editing all instances of "${selectedExam.examName}"` 
                  : `Editing "${selectedExam.name || selectedExam.examName}"`
                }
              </p>
            </div>
            
            <form onSubmit={handleUpdateExam} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={examForm.name}
                    onChange={(e) => setExamForm({...examForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter exam name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={examForm.type}
                    onChange={(e) => setExamForm({...examForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Exam Type</option>
                    <option value="unit_test">Unit Test</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="practical">Practical</option>
                    <option value="project">Project</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                {editingMode === 'instance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={examForm.classId}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={examForm.subjectId}
                        onChange={(e) => setExamForm({...examForm, subjectId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={examForm.academicYear}
                    onChange={(e) => setExamForm({...examForm, academicYear: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2024-25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={examForm.semester}
                    onChange={(e) => setExamForm({...examForm, semester: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., First Semester"
                  />
                </div>

                {editingMode === 'instance' && (
                  <>
                    {/* Scheduling */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={examForm.examDate}
                        onChange={(e) => setExamForm({...examForm, examDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={examForm.startTime}
                        onChange={(e) => setExamForm({...examForm, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={examForm.endTime}
                        onChange={(e) => setExamForm({...examForm, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={examForm.duration}
                        onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={examForm.venue}
                        onChange={(e) => setExamForm({...examForm, venue: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Room number or location"
                      />
                    </div>
                  </>
                )}

                {/* Marks */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Marks & Instructions</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({...examForm, totalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={examForm.passingMarks}
                    onChange={(e) => setExamForm({...examForm, passingMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={examForm.instructions}
                    onChange={(e) => setExamForm({...examForm, instructions: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Exam instructions for students..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Syllabus Coverage
                  </label>
                  <textarea
                    value={examForm.syllabus}
                    onChange={(e) => setExamForm({...examForm, syllabus: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Topics covered in this exam..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default ExamManagement;

