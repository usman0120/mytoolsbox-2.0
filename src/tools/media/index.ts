// media Space manifests (metadata only).
import CompressImage from "./compress-image/manifest";
import ResizeImage from "./resize-image/manifest";
import CropImage from "./crop-image/manifest";
import RotateImage from "./rotate-image/manifest";
import WatermarkImage from "./watermark-image/manifest";
import GrayscaleImage from "./grayscale-image/manifest";
import BlurSharpenImage from "./blur-sharpen-image/manifest";
import AddTextToImage from "./add-text-to-image/manifest";
import AutoEnhancePhoto from "./auto-enhance-photo/manifest";
import ConvertImage from "./convert-image/manifest";
import ImageToText from "./image-to-text/manifest";
import RemoveBackground from "./remove-background/manifest";
import PassportPhoto from "./passport-photo/manifest";
import TrimVideo from "./trim-video/manifest";
import ConvertVideo from "./convert-video/manifest";
import MuteVideo from "./mute-video/manifest";
import VideoToGif from "./video-to-gif/manifest";
import CompressVideo from "./compress-video/manifest";
import ResizeVideo from "./resize-video/manifest";
import MergeVideos from "./merge-videos/manifest";
import ScreenRecorder from "./screen-recorder/manifest";
import AudioCutter from "./audio-cutter/manifest";
import AudioConverter from "./audio-converter/manifest";
import Mp4ToMp3 from "./mp4-to-mp3/manifest";
import ExtractAudio from "./extract-audio/manifest";
import TextToSpeech from "./text-to-speech/manifest";
import SpeechToText from "./speech-to-text/manifest";
import PhotoEditor from "./photo-editor/manifest";
import VideoEditor from "./video-editor/manifest";

export const MEDIA_TOOLS = [
  CompressImage,
  ResizeImage,
  CropImage,
  RotateImage,
  WatermarkImage,
  GrayscaleImage,
  BlurSharpenImage,
  AddTextToImage,
  AutoEnhancePhoto,
  ConvertImage,
  ImageToText,
  RemoveBackground,
  PassportPhoto,
  TrimVideo,
  ConvertVideo,
  MuteVideo,
  VideoToGif,
  CompressVideo,
  ResizeVideo,
  MergeVideos,
  ScreenRecorder,
  AudioCutter,
  AudioConverter,
  Mp4ToMp3,
  ExtractAudio,
  TextToSpeech,
  SpeechToText,
  PhotoEditor,
  VideoEditor,
];
