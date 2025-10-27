"use client"

import { Fragment, useRef, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Track } from "@/types"
import { formatTime } from "@/lib/utils"
import { 
  SpeakerWaveIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon
} from "@heroicons/react/24/outline"

interface TrackModalProps {
  track: Track | null
  isOpen: boolean
  onClose: () => void
}

export function TrackModal({ track, isOpen, onClose }: TrackModalProps) {
  const cancelButtonRef = useRef(null)

  if (!track) return null

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900 mb-4"
                    >
                      Track Information
                    </Dialog.Title>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={`${track.album} cover`}
                          className="w-48 h-48 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                          <SpeakerWaveIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 w-full">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{track.name}</h4>
                        <p className="text-xl text-gray-700 mb-1">{track.artist}</p>
                        <p className="text-lg text-gray-600 mb-4">{track.album}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <span className="text-gray-500 block text-sm">Duration</span>
                            <span className="text-gray-900 font-medium">{formatTime(track.duration)}</span>
                          </div>
                          {track.popularity && (
                            <div>
                              <span className="text-gray-500 block text-sm">Popularity</span>
                              <span className="text-gray-900 font-medium">{track.popularity}/100</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => window.open(track.spotifyUrl, '_blank')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                          >
                            <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
                            Open in Spotify
                          </button>
                          
                          {track.previewUrl && (
                            <button
                              onClick={() => window.open(track.previewUrl!, '_blank')}
                              className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <PlayIcon className="w-5 h-5 mr-2" />
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!track.previewUrl && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-700 text-sm">
                          Preview not available for this track. Visit Spotify for full listening experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:hidden">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    ref={cancelButtonRef}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}