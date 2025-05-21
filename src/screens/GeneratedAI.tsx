import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAIInsight, clearInsight } from '../redux/slices/aiInsightSlice';
import { RootState, AppDispatch } from '../redux/store';
import { AIInsightResponse } from '../services/accidentService';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import NavigationService from '../context/NavigationService';
import TopBar from './components/TopBarComponent';

const GeneratedAI = () => {
  const [question, setQuestion] = useState('');
  const [showData, setShowData] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, currentInsight, suggestedQuestions } = useSelector(
    (state: RootState) => state.aiInsight
  );

  // Filter suggested questions based on input
  const filteredQuestions = useMemo(() => {
    if (!question.trim()) {
      return suggestedQuestions;
    }
    const searchTerm = question.toLowerCase();
    return suggestedQuestions.filter(q => 
      q.toLowerCase().includes(searchTerm)
    );
  }, [question, suggestedQuestions]);

  const handleQuestionSubmit = () => {
    if (question.trim()) {
      dispatch(fetchAIInsight(question));
    }
  };

  const handleSuggestedQuestion = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
    dispatch(fetchAIInsight(suggestedQuestion));
  };

  const handleClear = () => {
    setQuestion('');
    setShowData(false);
    dispatch(clearInsight());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationService.goBack()}
        >
          <ArrowLeftIcon size={20} color="black" />
        </TouchableOpacity>
      </View>
      
      <TopBar title="AI Insights" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionSection}>
          <Text style={styles.questionTitle}>Type your question:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask a question about accidents..."
              placeholderTextColor="#666"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleQuestionSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Ask</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.suggestedTitle}>Suggested Questions:</Text>
        <ScrollView style={styles.suggestedContainer}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((suggestedQuestion: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestedQuestion}
                onPress={() => handleSuggestedQuestion(suggestedQuestion)}
              >
                <Text style={styles.suggestedQuestionText}>{suggestedQuestion}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>No matching questions found</Text>
          )}
        </ScrollView>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generating insight...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {currentInsight && (
          <View style={styles.insightContainer}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>Insight:</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.insightText}>{currentInsight.insight}</Text>
            
            {currentInsight.rows && currentInsight.rows.length > 0 && (
              <View style={styles.dataContainer}>
                <TouchableOpacity
                  style={styles.dataHeader}
                  onPress={() => setShowData(!showData)}
                >
                  <Text style={styles.dataTitle}>Data</Text>
                  <Text style={styles.toggleText}>{showData ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
                
                {showData && (
                  <View style={styles.dataContent}>
                    {currentInsight.rows.map((row: any[], rowIndex: number) => (
                      <View key={rowIndex} style={styles.rowContainer}>
                        {row.map((cell: any, cellIndex: number) => (
                          <Text key={cellIndex} style={styles.cellText}>
                            {currentInsight.columns[cellIndex]}: {cell}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  questionSection: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'flex-end',
    minWidth: 100,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  suggestedContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  suggestedQuestion: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestedQuestionText: {
    fontSize: 14,
    color: '#333',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  insightContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  insightText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  dataContainer: {
    marginTop: 16,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dataContent: {
    marginTop: 12,
  },
  rowContainer: {
    marginBottom: 8,
  },
  cellText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default GeneratedAI; 