import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

const RecordingPlayer = ({ recordingUrl, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio || !recordingUrl) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const clickPercent = clickX / width
    const newTime = clickPercent * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  if (!recordingUrl) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-xs text-secondary-500">—</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <audio ref={audioRef} src={recordingUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play'}
        aria-label={isPlaying ? 'Pause recording' : 'Play recording'}
      >
        {isLoading ? (
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5" fill="currentColor" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Progress Bar and Time */}
      <div className="flex-1 min-w-0 flex items-center space-x-2">
        <div
          onClick={handleProgressClick}
          className="flex-1 h-1.5 bg-secondary-200 rounded-full cursor-pointer hover:bg-secondary-300 transition-colors relative overflow-hidden"
        >
          <div
            className="h-full bg-primary-600 transition-all duration-100"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex items-center space-x-1 text-xs text-secondary-600 flex-shrink-0">
          <Volume2 className="w-3 h-3" />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default RecordingPlayer
