import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BarChart3,
  Timer,
  Zap,
  File,
} from 'lucide-react';
import { API_CONFIG, DEFAULT_API_URL } from '@constants/config.js';
import { useMultipleRealtimeStatus } from '@hooks/useMultipleRealtimeStatus.js';

const Home = () => {
  const [platforms, setPlatforms] = useState({
    lefty: {
      status: 'idle',
      phase: 'idle',
      message: '',
      logs: [],
      start_time: null,
      end_time: null,
    },
    traackr: {
      status: 'idle',
      phase: 'idle',
      message: '',
      logs: [],
      start_time: null,
      end_time: null,
    },
    talkwalker: {
      status: 'idle',
      phase: 'idle',
      message: '',
      logs: [],
      start_time: null,
      end_time: null,
    },
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    lefty: {
      progress: 0,
      rowsProcessed: 0,
      totalRows: 0,
      storiesProcessed: 0,
      storiesTotal: 0,
      postsUploaded: 0,
      postsTotal: 0,
      elapsedTime: 0,
      estimatedTime: 0,
    },
    traackr: {
      progress: 0,
      rowsProcessed: 0,
      totalRows: 0,
      storiesProcessed: 0,
      storiesTotal: 0,
      postsUploaded: 0,
      postsTotal: 0,
      elapsedTime: 0,
      estimatedTime: 0,
    },
    talkwalker: {
      progress: 0,
      rowsProcessed: 0,
      totalRows: 0,
      storiesProcessed: 0,
      storiesTotal: 0,
      postsUploaded: 0,
      postsTotal: 0,
      elapsedTime: 0,
      estimatedTime: 0,
    },
  });

  const platformInfo = {
    lefty: {
      name: 'Lefty',
      description: 'Lefty',
      gradient: 'from-blue-500 to-blue-600',
      lightGradient: 'from-blue-50 to-blue-100',
      icon: '🎯',
      color: 'blue',
    },
    traackr: {
      name: 'Traackr',
      description: 'Traackr',
      gradient: 'from-purple-500 to-purple-600',
      lightGradient: 'from-purple-50 to-purple-100',
      icon: '📊',
      color: 'purple',
    },
    talkwalker: {
      name: 'Talkwalker',
      description: 'Talkwalker',
      gradient: 'from-emerald-500 to-emerald-600',
      lightGradient: 'from-emerald-50 to-emerald-100',
      icon: '📈',
      color: 'emerald',
    },
  };

  const { getDataForPlatform, getConnectionStatusForPlatform, allConnectionStatuses } =
    useMultipleRealtimeStatus(API_CONFIG, DEFAULT_API_URL);

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Función para extraer el nombre principal de la API
  const extractApiName = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Si es localhost o IP local, retornar "Local"
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return 'Local';
      }

      // Extraer el subdominio (primera parte antes del primer punto)
      const parts = hostname.split('.');
      if (parts.length > 1) {
        return parts[0]; // Retorna 'apist2' o 'api3'
      }

      return hostname;
    } catch (error) {
      console.log(`extractApiName ${error}`);
      return 'Unknown';
    }
  };

  useEffect(() => {
    const valid = ['lefty', 'traackr', 'talkwalker'];
    const newPlatforms = {};
    const newMetrics = {};

    valid.forEach((key) => {
      const apiData = getDataForPlatform(key);

      if (!apiData) {
        newPlatforms[key] = {
          status: 'idle',
          phase: 'idle',
          message: '',
          logs: [],
          start_time: null,
          end_time: null,
        };
        newMetrics[key] = {
          progress: 0,
          rowsProcessed: 0,
          totalRows: 0,
          downloadsTotalRows: 0,
          storiesProcessed: 0,
          storiesTotal: 0,
          downloadsRows: 0,
          postsUploaded: 0,
          postsTotal: 0,
          storiesFailed: 0,
          elapsedTime: 0,
          estimatedTime: 0,
        };
        return;
      }

      const capitalizedKey = capitalizeFirst(key);
      const val = apiData[capitalizedKey];

      const mapSingle = (val) => {
        if (!val)
          return {
            status: 'idle',
            phase: 'idle',
            message: '',
            logs: [],
            start_time: null,
            end_time: null,
          };
        return {
          status: val.phase || 'idle',
          phase: val.phase || 'idle',
          message: val.logs?.[val.logs.length - 1] || '',
          logs: val.logs || [],
          start_time: val.start_time,
          end_time: val.last_update,
        };
      };

      newPlatforms[key] = mapSingle(val);

      if (val) {
        const summary = val.execution_summary || {};
        const downloads = summary.downloads || {};
        let rowsDone = 0,
          rowsTotal = 0;
        if (downloads.total) {
          rowsDone += downloads.completed || 0;
          rowsTotal += downloads.total;
        }
        if (summary.posts?.total) {
          rowsDone += summary.posts.completed || 0;
          rowsTotal += summary.posts.total;
        }
        if (rowsTotal === 0 && val.items_count) {
          rowsTotal = val.items_count;
          rowsDone = Math.round(((val.overall_progress_percent || 0) * rowsTotal) / 100);
        }

        const stories = val.stories || {};
        const uploads = val.uploads || {};
        const downloads_files = val.downloads || {};
        const directory = val.directory || {};

        newMetrics[key] = {
          progress: val.overall_progress_percent || 0,
          rowsProcessed: rowsDone,
          totalRows: rowsTotal,
          downloadsRows: downloads_files.completed || 0,
          downloadsTotalRows: downloads_files.total || 0,
          storiesProcessed: stories.current_row || 0,
          storiesFailed: stories.failed || 0,
          storiesTotal: stories.total_rows || 0,
          postsUploaded: uploads.posts_uploaded || 0,
          postsTotal: uploads.total_posts || 0,
          directoryCurrent: directory.current_row || 0,
          directoryTotal: directory.total_rows || 0,
          elapsedTime: summary.execution_time.elapsed_minutes || 0,
          estimatedTime: val.time_estimation?.total_remaining_minutes,
        };
      } else {
        newMetrics[key] = {
          progress: 0,
          rowsProcessed: 0,
          totalRows: 0,
          downloadsTotalRows: 0,
          storiesProcessed: 0,
          storiesTotal: 0,
          downloadsRows: 0,
          postsUploaded: 0,
          postsTotal: 0,
          storiesFailed: 0,
          elapsedTime: 0,
          estimatedTime: 0,
        };
      }
    });

    setPlatforms(newPlatforms);
    setPlatformMetrics(newMetrics);
  }, [getDataForPlatform]);

  const formatTime = (sec) => {
    if (sec === 0) return '--:--';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h) return `${h}h ${m}m ${s}s`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  };

  function formatElapsed(min) {
    if (!min || isNaN(min)) return '00:00';

    const totalSec = Math.floor(min * 60);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (h) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const formatDateTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusIcon = (status) => {
    if (['running', 'downloading', 'uploading', 'processing'].includes(status)) {
      return <Loader2 className="h-6 w-6 animate-spin" />;
    }
    if (status === 'completed') return <CheckCircle2 className="h-6 w-6" />;
    if (status === 'error') return <AlertCircle className="h-6 w-6" />;
    return <Activity className="h-6 w-6" />;
  };

  const getStatusColor = (status) => {
    if (['running', 'downloading', 'uploading', 'processing'].includes(status)) {
      return 'bg-blue-500/20 text-white';
    }
    if (status === 'completed') return 'bg-green-500/20 text-white';
    if (status === 'error') return 'bg-red-500/20 text-white';
    return 'bg-gray-500/20 text-white';
  };

  // Función para obtener la URL de API de una plataforma
  const getApiUrlForPlatform = (platform) => {
    const config = API_CONFIG[platform];
    return config?.useDefaultApi ? DEFAULT_API_URL : config?.url || DEFAULT_API_URL;
  };

  function formatTimeFromMinutes(decimalMinutes) {
    const totalSeconds = Math.floor(decimalMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time progress tracking and analytics</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-3">
        {Object.entries(platforms).map(([key, platform]) => {
          const info = platformInfo[key];
          const m = platformMetrics[key];
          const connectionStatus = getConnectionStatusForPlatform(key);
          const apiUrl = getApiUrlForPlatform(key);
          const apiName = extractApiName(apiUrl);
          const isRunning = [
            'running',
            'downloading',
            'uploading',
            'processing',
            'Processing stories',
            'mapping',
            'completed',
            'error',
            'Uploading directory',
          ].includes(platform.status);
          const isCompleted = platform.status === 'completed';
          const hasError = platform.status === 'error';
          const isIdle = platform.status === 'idle';

          return (
            <div
              key={key}
              className={`rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 ${isRunning ? 'scale-[1.02] border-blue-200' : 'border-gray-100'}`}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r p-6 ${info.gradient}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl drop-shadow-lg">{info.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{info.name}</h3>
                      <p className="text-sm text-white/80">{info.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getStatusColor(platform.status)}`}
                  >
                    {getStatusIcon(platform.status)}
                    <span className="capitalize">{platform.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        connectionStatus === 'Connected'
                          ? 'bg-green-400'
                          : connectionStatus === 'Error'
                            ? 'bg-red-500'
                            : 'bg-yellow-400'
                      } `}
                    />
                    <span
                      className={`text-xs font-medium ${
                        connectionStatus === 'Connected'
                          ? 'text-green-100'
                          : connectionStatus === 'Error'
                            ? 'text-white'
                            : 'text-yellow-100'
                      } `}
                    >
                      {apiName}: {connectionStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Status Indicator */}
              <div
                className={`h-1 ${
                  connectionStatus === 'Connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'Error'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                }`}
              />

              {/* Body */}
              <div className="p-6">
                {(isRunning || isCompleted) && (
                  <>
                    {/* Overall Progress */}
                    <div className="mb-6">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                        <span className="text-lg font-bold text-gray-900">
                          {Math.round(m.progress)}%
                        </span>
                      </div>
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full bg-gradient-to-r ${info.gradient} transition-all duration-500`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                      {/* Items Processed */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="mb-2 flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Camp. Downloaded</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {m.downloadsRows.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          of {m.downloadsTotalRows.toLocaleString()}
                        </p>
                      </div>

                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Directory</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.directoryCurrent}</p>
                        <p className="mt-1 text-xs text-gray-500">of {m.directoryTotal}</p>
                      </div>

                      {/* Posts Uploaded */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Posts Uploaded</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.postsUploaded}</p>
                        <p className="mt-1 text-xs text-gray-500">of {m.postsTotal}</p>
                      </div>

                      {/* Stories Processed */}
                      {info?.description !== 'Talkwalker' ? (
                        <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                          <div className="mb-2 flex items-center gap-2">
                            <Database className="h-4 w-4 text-gray-600" />
                            <p className="text-xs font-medium text-gray-600">Stories Processed</p>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{m.storiesProcessed}</p>
                          <p className="mt-1 text-xs text-gray-500">of {m.storiesTotal}</p>
                        </div>
                      ) : (
                        <></>
                      )}

                      {/* Time Elapsed */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Time Elapsed</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatElapsed(m.elapsedTime)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">since start</p>
                      </div>

                      {/* Time Remaining */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="mb-2 flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {isCompleted
                            ? '✓ Done'
                            : formatTimeFromMinutes(m.estimatedTime)
                              ? formatTimeFromMinutes(m.estimatedTime)
                              : '--:--'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">estimated</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Último mensaje */}
                {platform.message && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">{platform.message}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="mb-4 space-y-2 text-sm">
                  {platform.start_time && (
                    <div className="flex justify-between text-gray-500">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Started
                      </span>
                      <span className="font-medium">{formatDateTime(platform.start_time)}</span>
                    </div>
                  )}
                  {platform.end_time && (
                    <div className="flex justify-between text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Last Update
                      </span>
                      <span className="font-medium">{formatDateTime(platform.end_time)}</span>
                    </div>
                  )}
                </div>

                {/* Logs */}
                {platform.logs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 font-medium text-gray-700">Logs</h4>
                    <ul className="max-h-32 list-inside list-disc overflow-y-auto text-xs text-gray-600">
                      {platform.logs.map((log, i) => (
                        <li key={i}>{log}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Idle */}
                {isIdle && (
                  <div className="py-8 text-center">
                    <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Platform is idle</p>
                    <p className="mt-1 text-sm text-gray-400">Waiting for execution</p>
                  </div>
                )}

                {/* Error */}
                {hasError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Error occurred</p>
                        <p className="mt-1 text-sm text-red-600">{platform.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
