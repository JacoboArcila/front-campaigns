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
  File
} from 'lucide-react';
import useRealtimeStatus from '@hooks/useRealtimeStatus';

const Home = () => {
  const [platforms, setPlatforms] = useState({
    lefty:     { status: 'idle', phase: 'idle', message: '', logs: [], start_time: null, end_time: null },
    traackr:   { status: 'idle', phase: 'idle', message: '', logs: [], start_time: null, end_time: null },
    talkwalker:{ status: 'idle', phase: 'idle', message: '', logs: [], start_time: null, end_time: null }
  });

  const [platformMetrics, setPlatformMetrics] = useState({
    lefty:     { progress: 0, rowsProcessed: 0, totalRows: 0, storiesProcessed: 0, storiesTotal: 0, postsUploaded: 0, postsTotal: 0, elapsedTime: 0, estimatedTime: 0 },
    traackr:   { progress: 0, rowsProcessed: 0, totalRows: 0, storiesProcessed: 0, storiesTotal: 0, postsUploaded: 0, postsTotal: 0, elapsedTime: 0, estimatedTime: 0 },
    talkwalker:{ progress: 0, rowsProcessed: 0, totalRows: 0, storiesProcessed: 0, storiesTotal: 0, postsUploaded: 0, postsTotal: 0, elapsedTime: 0, estimatedTime: 0 }
  });

  const platformInfo = {
    lefty: {
      name: 'Lefty',
      description: 'Lefty',
      gradient: 'from-blue-500 to-blue-600',
      lightGradient: 'from-blue-50 to-blue-100',
      icon: '🎯',
      color: 'blue'
    },
    traackr: {
      name: 'Traackr',
      description: 'Traackr',
      gradient: 'from-purple-500 to-purple-600',
      lightGradient: 'from-purple-50 to-purple-100',
      icon: '📊',
      color: 'purple'
    },
    talkwalker: {
      name: 'Talkwalker',
      description: 'Talkwalker',
      gradient: 'from-emerald-500 to-emerald-600',
      lightGradient: 'from-emerald-50 to-emerald-100',
      icon: '📈',
      color: 'emerald'
    }
  };

  const { data: apiData, connectionStatus } = useRealtimeStatus('http://apist2.prismgrp.com/api2');

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    if (!apiData) return;

    const mapSingle = (val) => {
      if (!val) return { status: 'idle', phase: 'idle', message: '', logs: [], start_time: null, end_time: null };
      return {
        status: val.phase || 'idle',
        phase: val.phase || 'idle',
        message: val.logs?.[val.logs.length - 1] || '',
        logs: val.logs || [],
        start_time: val.start_time,
        end_time: val.last_update
      };
    };

    const valid = ['lefty', 'traackr', 'talkwalker'];
    const newPlatforms = {};
    const newMetrics   = {};

    valid.forEach((key) => {
      const capitalizedKey = capitalizeFirst(key); // Convierte 'facebook' -> 'Facebook'
      const val = apiData[capitalizedKey];
      console.log(apiData)
      newPlatforms[key] = mapSingle(val);

      if (val) {
        // filas processed / total
        const summary   = val.execution_summary || {};
        const downloads = summary.downloads || {};
        let rowsDone = 0, rowsTotal = 0;
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
          rowsDone  = Math.round((val.overall_progress_percent || 0) * rowsTotal / 100);
        }

        // stories y posts
        const stories = val.stories || {};
        const uploads = val.uploads || {};
        const downloads_files = val.downloads || {};

        let elapsedSec = 0;
        if (val.start_time) {
          const startMs = new Date(val.start_time).getTime();
          // si ya acabó o hubo error, medimos hasta el último update
          const endOrNow = (val.phase === 'completed' || val.phase === 'error')
            ? new Date(val.last_update).getTime()
            : Date.now();
          elapsedSec = Math.floor((endOrNow - startMs) / 1000);
        }

        newMetrics[key] = {
          progress: val.overall_progress_percent || 0,
          rowsProcessed: rowsDone,
          totalRows: rowsTotal,
          downloadsRows: downloads_files.completed || 0,
          downloadsTotalRows: downloads_files.total || 0,
          storiesProcessed: stories.processed  || 0,
          storiesFailed:    stories.failed || 0,
          storiesTotal:     stories.total_rows || 0,
          postsUploaded:    uploads.posts_uploaded || 0,
          postsTotal:       uploads.total_posts    || 0,
          elapsedTime: elapsedSec,
          estimatedTime: val.estimated_remaining_minutes
                        ? val.estimated_remaining_minutes * 60
                        : 0
        };
      } else {
        newMetrics[key] = {
          progress: 0, rowsProcessed: 0, totalRows: 0, downloadsTotalRows: 0,
          storiesProcessed: 0, storiesTotal: 0, downloadsRows: 0,
          postsUploaded: 0, postsTotal: 0, storiesFailed: 0,
          elapsedTime: 0, estimatedTime: 0
        };
      }
    });


    setPlatforms(newPlatforms);
    setPlatformMetrics(newMetrics);
  }, [apiData]);

  const formatTime = (sec) => {
    if (sec === 0) return '--:--';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h) return `${h}h ${m}m ${s}s`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatDateTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: false
    });
  };

  const getStatusIcon = (status) => {
    if (['running','downloading','uploading','processing'].includes(status)) {
      return <Loader2 className="w-6 h-6 animate-spin" />;
    }
    if (status === 'completed') return <CheckCircle2 className="w-6 h-6" />;
    if (status === 'error')     return <AlertCircle className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  const getStatusColor = (status) => {
    if (['running','downloading','uploading','processing'].includes(status)) {
      return 'bg-blue-500/20 text-white';
    }
    if (status === 'completed') return 'bg-green-500/20 text-white';
    if (status === 'error')     return 'bg-red-500/20 text-white';
    return 'bg-gray-500/20 text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time progress tracking and analytics</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            connectionStatus === 'Connected' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${
              connectionStatus === 'Connected' ? 'text-green-700' : 'text-red-700'
            }`}>
              WS: {connectionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(platforms).map(([key, platform]) => {
          const info = platformInfo[key];
          const m = platformMetrics[key];
          const isRunning  = ['running','downloading','uploading','processing', 'processing_stories', 'mapping', 'uploading', 'completed', 'error'].includes(platform.status);
          const isCompleted= platform.status === 'completed';
          const hasError   = platform.status === 'error';
          const isIdle     = platform.status === 'idle';

          return (
            <div key={key}
                 className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300
                             ${isRunning ? 'border-blue-200 scale-[1.02]' : 'border-gray-100'}`}>
              {/* Header */}
              <div className={`p-6 bg-gradient-to-r ${info.gradient}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl drop-shadow-lg">{info.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{info.name}</h3>
                      <p className="text-white/80 text-sm">{info.description}</p>
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(platform.status)}`}>
                  {getStatusIcon(platform.status)}
                  <span className="capitalize">{platform.status}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {(isRunning || isCompleted) && (
                  <>
                    {/* Overall Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                        <span className="text-lg font-bold text-gray-900">{Math.round(m.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${info.gradient} transition-all duration-500`}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Items Processed */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <File className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Downloaded files</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.downloadsRows.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">of {m.downloadsTotalRows.toLocaleString()}</p>
                      </div>

                      {/* Posts Uploaded */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Posts Uploaded</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.postsUploaded}</p>
                        <p className="text-xs text-gray-500 mt-1">of {m.postsTotal}</p>
                      </div>

                      {/* Stories Processed */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Stories Processed</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.storiesProcessed}</p>
                        <p className="text-xs text-gray-500 mt-1">of {m.storiesTotal}</p>
                      </div>

                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Stories Failed</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{m.storiesFailed}</p>
                        <p className="text-xs text-gray-500 mt-1">of {m.storiesTotal}</p>
                      </div>
                      

                      {/* Time Elapsed */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Time Elapsed</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatTime(m.elapsedTime)}</p>
                        <p className="text-xs text-gray-500 mt-1">since start</p>
                      </div>

                      {/* Time Remaining */}
                      <div className={`bg-gradient-to-br ${info.lightGradient} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Timer className="w-4 h-4 text-gray-600" />
                          <p className="text-xs font-medium text-gray-600">Time Remaining</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {isCompleted ? '✓ Done' : formatTime(m.estimatedTime)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">estimated</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Último mensaje */}
                {platform.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{platform.message}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="space-y-2 text-sm mb-4">
                  {platform.start_time && (
                    <div className="flex justify-between text-gray-500">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> Started
                      </span>
                      <span className="font-medium">{formatDateTime(platform.start_time)}</span>
                    </div>
                  )}
                  {platform.end_time && (
                    <div className="flex justify-between text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Last Update
                      </span>
                      <span className="font-medium">{formatDateTime(platform.end_time)}</span>
                    </div>
                  )}
                </div>

                {/* Logs */}
                {platform.logs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Logs</h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside max-h-32 overflow-y-auto">
                      {platform.logs.map((log, i) => (
                        <li key={i}>{log}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Idle */}
                {isIdle && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Platform is idle</p>
                    <p className="text-sm text-gray-400 mt-1">Waiting for execution</p>
                  </div>
                )}

                {/* Error */}
                {hasError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Error occurred</p>
                        <p className="text-sm text-red-600 mt-1">{platform.message}</p>
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
