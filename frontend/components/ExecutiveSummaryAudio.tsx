'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'

interface Props {
  summaryText: string
}

export function ExecutiveSummaryAudio({ summaryText }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePlayAudio = async () => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

    if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
      setError('ElevenLabs API key not configured. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local')
      return
    }

    if (audio && isPlaying) {
      // Stop current audio
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
      setAudio(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Call ElevenLabs TTS API
      // Using Rachel voice (voice_id: 21m00Tcm4TlvDq8ikWAM)
      const voiceId = '21m00Tcm4TlvDq8ikWAM'
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: summaryText,
            model_id: 'eleven_flash_v2_5', // Fast, low-latency model
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail?.message || `API error: ${response.status}`)
      }

      // Convert response to audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create and play audio
      const newAudio = new Audio(audioUrl)
      newAudio.onended = () => {
        setIsPlaying(false)
        setAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      newAudio.onerror = () => {
        setError('Failed to play audio')
        setIsPlaying(false)
        setAudio(null)
      }

      setAudio(newAudio)
      await newAudio.play()
      setIsPlaying(true)
    } catch (err: any) {
      setError(err.message || 'Failed to generate audio')
      setIsPlaying(false)
      setAudio(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePlayAudio}
        disabled={isLoading}
        variant={isPlaying ? 'destructive' : 'outline'}
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating audio...
          </>
        ) : isPlaying ? (
          <>
            <VolumeX className="w-4 h-4" />
            Stop Audio
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            Play Audio Summary
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-xs text-gray-500">
        Powered by ElevenLabs • {summaryText.length} characters
      </p>
    </div>
  )
}
