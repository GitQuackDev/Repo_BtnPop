/**
 * Test script for the BTN Pop CMS API
 * This script tests the main API endpoints to ensure they're working correctly
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let testNewsId = '';
let testEventId = '';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set authorization token for subsequent requests
const setAuthToken = (newToken) => {
  token = newToken;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Test functions
async function testAuth() {
  console.log('\n=== Testing Authentication ===');
  try {
    // Login with admin credentials
    console.log('Testing login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@btnpop.com',
      password: 'adminPassword123',
    });

    if (loginResponse.data.token) {
      console.log('✅ Login successful');
      setAuthToken(loginResponse.data.token);
    } else {
      console.error('❌ Login failed: No token returned');
      return false;
    }

    // Get current user
    console.log('Testing get current user...');
    const userResponse = await api.get('/auth/me');
    if (userResponse.data && userResponse.data.username) {
      console.log(`✅ Current user: ${userResponse.data.username} (${userResponse.data.role})`);
    } else {
      console.error('❌ Failed to get current user');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testNews() {
  console.log('\n=== Testing News Endpoints ===');
  try {
    // Create a test news article
    console.log('Creating test news article...');
    const createResponse = await api.post('/news', {
      title: 'Test News Article',
      subtitle: 'This is a test subtitle',
      content: '<p>This is test content for the news article.</p>',
      author: 'Test Author',
      category: 'General',
      featured: false,
      trending: false,
    });

    if (createResponse.data && createResponse.data._id) {
      testNewsId = createResponse.data._id;
      console.log(`✅ Test news created with ID: ${testNewsId}`);
    } else {
      console.error('❌ Failed to create test news');
      return false;
    }

    // Get all news
    console.log('Testing get all news...');
    const allNewsResponse = await api.get('/news');
    if (allNewsResponse.data && allNewsResponse.data.news) {
      console.log(`✅ Retrieved ${allNewsResponse.data.news.length} news articles`);
    } else {
      console.error('❌ Failed to get all news');
      return false;
    }

    // Get news by ID
    console.log('Testing get news by ID...');
    const newsResponse = await api.get(`/news/${testNewsId}`);
    if (newsResponse.data && newsResponse.data._id === testNewsId) {
      console.log('✅ Retrieved news by ID successfully');
    } else {
      console.error('❌ Failed to get news by ID');
      return false;
    }

    // Update news
    console.log('Testing update news...');
    const updateResponse = await api.put(`/news/${testNewsId}`, {
      title: 'Updated Test News Article',
      trending: true,
    });

    if (updateResponse.data && updateResponse.data.title === 'Updated Test News Article') {
      console.log('✅ Updated news successfully');
    } else {
      console.error('❌ Failed to update news');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ News test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEvents() {
  console.log('\n=== Testing Events Endpoints ===');
  try {
    // Create a test event
    console.log('Creating test event...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
    
    const createResponse = await api.post('/events', {
      title: 'Test Event',
      description: 'This is a test event description.',
      eventDate: futureDate.toISOString(),
      location: 'Test Location',
      organizer: 'Test Organizer',
      category: 'Conference',
      registrationRequired: true,
      isFeatured: false,
    });

    if (createResponse.data && createResponse.data._id) {
      testEventId = createResponse.data._id;
      console.log(`✅ Test event created with ID: ${testEventId}`);
    } else {
      console.error('❌ Failed to create test event');
      return false;
    }

    // Get all events
    console.log('Testing get all events...');
    const allEventsResponse = await api.get('/events');
    if (allEventsResponse.data && allEventsResponse.data.events) {
      console.log(`✅ Retrieved ${allEventsResponse.data.events.length} events`);
    } else {
      console.error('❌ Failed to get all events');
      return false;
    }

    // Get upcoming events
    console.log('Testing get upcoming events...');
    const upcomingEventsResponse = await api.get('/events?upcoming=true');
    if (upcomingEventsResponse.data && upcomingEventsResponse.data.events) {
      console.log(`✅ Retrieved ${upcomingEventsResponse.data.events.length} upcoming events`);
    } else {
      console.error('❌ Failed to get upcoming events');
      return false;
    }

    // Get event by ID
    console.log('Testing get event by ID...');
    const eventResponse = await api.get(`/events/${testEventId}`);
    if (eventResponse.data && eventResponse.data._id === testEventId) {
      console.log('✅ Retrieved event by ID successfully');
    } else {
      console.error('❌ Failed to get event by ID');
      return false;
    }

    // Update event
    console.log('Testing update event...');
    const updateResponse = await api.put(`/events/${testEventId}`, {
      title: 'Updated Test Event',
      isFeatured: true,
    });

    if (updateResponse.data && updateResponse.data.title === 'Updated Test Event') {
      console.log('✅ Updated event successfully');
    } else {
      console.error('❌ Failed to update event');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Events test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n=== Cleaning Up Test Data ===');
  try {
    // Delete the test news article
    if (testNewsId) {
      console.log('Deleting test news article...');
      const deleteNewsResponse = await api.delete(`/news/${testNewsId}`);
      if (deleteNewsResponse.data && deleteNewsResponse.data.message) {
        console.log('✅ Test news deleted successfully');
      } else {
        console.error('❌ Failed to delete test news');
      }
    }

    // Delete the test event
    if (testEventId) {
      console.log('Deleting test event...');
      const deleteEventResponse = await api.delete(`/events/${testEventId}`);
      if (deleteEventResponse.data && deleteEventResponse.data.message) {
        console.log('✅ Test event deleted successfully');
      } else {
        console.error('❌ Failed to delete test event');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Starting API Tests ===');
  
  // Test authentication
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.error('❌ Authentication tests failed. Stopping further tests.');
    return;
  }
  
  // Test news endpoints
  const newsSuccess = await testNews();
  if (!newsSuccess) {
    console.error('❌ News tests failed.');
  }
  
  // Test events endpoints
  const eventsSuccess = await testEvents();
  if (!eventsSuccess) {
    console.error('❌ Events tests failed.');
  }
  
  // Clean up test data
  await cleanup();
  
  console.log('\n=== Test Summary ===');
  console.log(`Authentication: ${authSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`News Endpoints: ${newsSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Events Endpoints: ${eventsSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n=== Tests Completed ===');
}

// Run the tests
runTests();
