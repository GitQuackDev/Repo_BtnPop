import React, { useState, useEffect } from 'react';
import { FaDownload, FaCheck, FaTimes, FaUserCheck, FaUserTimes, FaSearch } from 'react-icons/fa';
import { eventsApi, participantsApi } from '../../services/api';
import './ParticipantsManager.css';

function ParticipantsManager({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'confirmed', 'pending', 'cancelled'
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch event details
      if (eventId) {
        const eventData = await eventsApi.getEventById(eventId);
        setEvent(eventData);
        
        // Fetch participants for this event
        const participantsData = await participantsApi.getEventParticipants(eventId);
        setParticipants(participantsData);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh data
  const handleRefresh = () => {
    fetchData();
  };
  
  useEffect(() => {
    fetchData();
  }, [eventId]);
    // Handle participant status update
  const handleStatusChange = async (participantId, newStatus) => {
    try {
      // Call API to update status
      const updatedParticipant = await participantsApi.updateParticipantStatus(participantId, newStatus);
      
      // Update local state to reflect the change
      setParticipants(prevParticipants => 
        prevParticipants.map(p => 
          p._id === participantId ? {...p, status: newStatus} : p
        )
      );
      
      // If the event is updated (e.g., participant count changed), update event state
      if (updatedParticipant.event && updatedParticipant.event._id === event._id) {
        setEvent(updatedParticipant.event);
      }
      
      // Show a brief success message
      const statusMessages = {
        'confirmed': 'Participant confirmed successfully',
        'cancelled': 'Participant registration cancelled',
        'pending': 'Participant status set to pending'
      };
      
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'participants-manager__notification';
      notification.innerText = statusMessages[newStatus] || 'Status updated successfully';
      document.querySelector('.participants-manager').appendChild(notification);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating participant status:', err);
      alert('Failed to update participant status. Please try again.');
    }
  };
    // Handle ticket download
  const handleDownloadTicket = (participantId, joinId) => {
    try {
      const ticketUrl = participantsApi.downloadTicket(participantId);
      
      // Create a hidden anchor and trigger click to download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = ticketUrl;
      a.download = `event-ticket-${joinId}.pdf`;
      a.target = '_blank'; // Open in new tab to handle potential issues
      
      document.body.appendChild(a);
      a.click();
      
      // Show download started notification
      const notification = document.createElement('div');
      notification.className = 'participants-manager__notification';
      notification.innerText = 'Ticket download started';
      document.querySelector('.participants-manager').appendChild(notification);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
      
      // Remove the anchor after clicking
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'participants-manager__notification participants-manager__notification--error';
      notification.innerText = 'Failed to download ticket. Please try again.';
      document.querySelector('.participants-manager').appendChild(notification);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
    }
  };
  
  // Export participants as CSV
  const exportToCSV = () => {
    if (!participants.length) {
      alert('No participants to export');
      return;
    }
    
    try {
      // Define CSV header row
      const csvHeader = ['Name', 'Email', 'Phone', 'Status', 'Registration ID', 'Registration Date'];
      
      // Convert participants to CSV rows
      const csvRows = participants.map(participant => [
        participant.name,
        participant.email,
        participant.phone,
        participant.status,
        participant.joinId,
        new Date(participant.createdAt || Date.now()).toLocaleString()
      ]);
      
      // Combine header and rows
      const csvContent = [
        csvHeader.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Set link properties
      link.setAttribute('href', url);
      link.setAttribute('download', `participants-${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'participants-manager__notification';
      notification.innerText = 'Participants exported successfully';
      document.querySelector('.participants-manager').appendChild(notification);
      
      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 3000);
      
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      alert('Failed to export participants. Please try again.');
    }
  };
  
  // Filter and search participants
  const filteredParticipants = participants.filter(participant => {
    // Apply status filter
    if (filterStatus !== 'all' && participant.status !== filterStatus) {
      return false;
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        participant.name.toLowerCase().includes(searchLower) ||
        participant.email.toLowerCase().includes(searchLower) ||
        participant.phone.toLowerCase().includes(searchLower) ||
        participant.joinId.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="participants-manager__loading">
        <div className="spinner"></div>
        <p>Loading participants...</p>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="participants-manager__error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="participants-manager">      <div className="participants-manager__header">
        <div className="participants-manager__title-wrapper">
          <h2>
            {event && `Event Participants: ${event.title}`}
            {!event && 'Event Participants'}
          </h2>
          <button 
            className="participants-manager__refresh-btn" 
            onClick={handleRefresh}
            title="Refresh participants data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </button>
        </div>
        
        {event && (
          <div className="participants-manager__event-info">
            <div className="participants-manager__event-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {event.eventTime && ` at ${event.eventTime}`}
              </span>
            </div>
            <div className="participants-manager__event-status">
              <span className={`participants-manager__event-badge ${event.registrationEnabled ? 'open' : 'closed'}`}>
                {event.registrationEnabled ? 'Registration Open' : 'Registration Closed'}
              </span>
              {event.registrationEnabled && event.maxParticipants > 0 && (
                <span className="participants-manager__capacity">
                  Capacity: {participants.length}/{event.maxParticipants}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="participants-manager__stats">
          <div className="participants-manager__stat">
            <span className="participants-manager__stat-label">Total:</span>
            <span className="participants-manager__stat-value">{participants.length}</span>
          </div>
          <div className="participants-manager__stat">
            <span className="participants-manager__stat-label">Confirmed:</span>
            <span className="participants-manager__stat-value">
              {participants.filter(p => p.status === 'confirmed').length}
            </span>
          </div>
          <div className="participants-manager__stat">
            <span className="participants-manager__stat-label">Pending:</span>
            <span className="participants-manager__stat-value">
              {participants.filter(p => p.status === 'pending').length}
            </span>
          </div>
          <div className="participants-manager__stat">
            <span className="participants-manager__stat-label">Cancelled:</span>
            <span className="participants-manager__stat-value">
              {participants.filter(p => p.status === 'cancelled').length}
            </span>
          </div>
        </div>
      </div>
        <div className="participants-manager__filters">
        <div className="participants-manager__search">
          <FaSearch className="participants-manager__search-icon" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="participants-manager__search-input"
          />
        </div>
        
        <div className="participants-manager__actions-wrapper">
          <div className="participants-manager__status-filter">
            <button 
              className={`participants-manager__filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button 
              className={`participants-manager__filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('confirmed')}
            >
              Confirmed
            </button>
            <button 
              className={`participants-manager__filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button 
              className={`participants-manager__filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled
            </button>
          </div>
          
          <button 
            className="participants-manager__export-btn"
            onClick={exportToCSV}
            title="Export participants to CSV"
            disabled={!participants.length}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>
      
      <div className="participants-manager__table-container">
        {filteredParticipants.length > 0 ? (
          <table className="participants-manager__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registration ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map(participant => (
                <tr key={participant._id} className={`status-${participant.status}`}>
                  <td>{participant.name}</td>
                  <td>{participant.email}</td>
                  <td>{participant.phone}</td>
                  <td>{participant.joinId}</td>
                  <td>
                    <span className={`participants-manager__status participants-manager__status--${participant.status}`}>
                      {participant.status}
                    </span>
                  </td>
                  <td>
                    <div className="participants-manager__actions">
                      <button 
                        onClick={() => handleDownloadTicket(participant._id, participant.joinId)}
                        className="participants-manager__action-btn"
                        title="Download Ticket"
                      >
                        <FaDownload />
                      </button>
                      
                      {participant.status !== 'confirmed' && (
                        <button 
                          onClick={() => handleStatusChange(participant._id, 'confirmed')}
                          className="participants-manager__action-btn participants-manager__action-btn--confirm"
                          title="Confirm Participant"
                        >
                          <FaUserCheck />
                        </button>
                      )}
                      
                      {participant.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusChange(participant._id, 'cancelled')}
                          className="participants-manager__action-btn participants-manager__action-btn--cancel"
                          title="Cancel Participant"
                        >
                          <FaUserTimes />
                        </button>
                      )}
                      
                      {participant.status === 'cancelled' && (
                        <button 
                          onClick={() => handleStatusChange(participant._id, 'pending')}
                          className="participants-manager__action-btn participants-manager__action-btn--restore"
                          title="Restore to Pending"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="participants-manager__empty">
            {searchTerm || filterStatus !== 'all' ? (
              <p>No participants match your search criteria.</p>
            ) : (
              <p>No participants have registered for this event yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantsManager;
