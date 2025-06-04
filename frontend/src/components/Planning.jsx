import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, startOfYear, endOfYear, addYears, subYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Planning = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [viewMode, setViewMode] = useState('month'); // 'week', 'month', 'year'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plannings, setPlannings] = useState([]);

  // Types de service avec couleurs accessibles
  const serviceTypes = {
    matin: { label: 'Matin', color: 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100', abbr: 'M' },
    apres_midi: { label: 'Après-midi', color: 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100', abbr: 'AM' },
    journee: { label: 'Journée', color: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100', abbr: 'J' },
    nuit: { label: 'Nuit', color: 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100', abbr: 'N' },
    repos: { label: 'Repos', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100', abbr: 'R' },
    vacances: { label: 'Vacances', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100', abbr: 'V' },
  };

  const getDays = () => {
    switch (viewMode) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
      case 'year':
        return eachDayOfInterval({
          start: startOfYear(currentDate),
          end: endOfYear(currentDate)
        });
      default:
        return [];
    }
  };

  const handleDateNavigation = (direction) => {
    switch (viewMode) {
      case 'week':
        setCurrentDate(direction > 0 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case 'year':
        setCurrentDate(direction > 0 ? addYears(currentDate, 1) : subYears(currentDate, 1));
        break;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Planning</h1>
          <ThemeToggle />
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleDateNavigation(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Précédent
          </button>
          <button
            onClick={() => handleDateNavigation(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Suivant
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          {Object.entries(serviceTypes).map(([key, { label, color }]) => (
            <div key={key} className={`px-4 py-2 rounded ${color}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDays().map((day) => (
            <div
              key={day.toString()}
              className="p-4 border rounded dark:border-gray-700"
            >
              <div className="text-sm font-medium dark:text-gray-300">
                {format(day, 'EEEE d MMMM', { locale: fr })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Planning;