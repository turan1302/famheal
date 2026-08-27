package com.famheal

import android.content.ContentValues
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.util.concurrent.Executors

class BackupFileModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  private val io = Executors.newSingleThreadExecutor()

  override fun getName() = "BackupFileModule"

  @ReactMethod
  fun saveJson(fileName: String, contents: String, promise: Promise) {
    io.execute {
      try {
        val bytes = contents.toByteArray(Charsets.UTF_8)
        if (bytes.isEmpty()) {
          promise.reject("write-failed", "Yedek içeriği boş")
          return@execute
        }
        val (uri, size) = writeToDownloads(fileName, bytes)
        if (size <= 0) {
          promise.reject("write-failed", "Dosya boş yazıldı")
          return@execute
        }
        val result = Arguments.createMap().apply {
          putString("uri", uri.toString())
          putInt("size", size)
        }
        promise.resolve(result)
      } catch (error: Exception) {
        promise.reject("write-failed", error)
      }
    }
  }

  @ReactMethod
  fun readText(uriString: String, promise: Promise) {
    io.execute {
      try {
        val uri = Uri.parse(uriString)
        openStream(uri).use { stream ->
          promise.resolve(stream.bufferedReader(Charsets.UTF_8).readText())
        }
      } catch (error: Exception) {
        promise.reject("read-failed", error)
      }
    }
  }

  private fun writeToDownloads(fileName: String, bytes: ByteArray): Pair<Uri, Int> {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      val resolver = context.contentResolver
      val values =
        ContentValues().apply {
          put(MediaStore.Downloads.DISPLAY_NAME, fileName)
          put(MediaStore.Downloads.MIME_TYPE, "application/json")
          put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
          put(MediaStore.Downloads.IS_PENDING, 1)
        }
      val uri =
        resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
          ?: throw IllegalStateException("İndirilenler kaydı oluşturulamadı")
      try {
        resolver.openOutputStream(uri, "w")?.use { stream ->
          stream.write(bytes)
          stream.flush()
        } ?: throw IllegalStateException("Dosya yazılamadı")
      } catch (error: Exception) {
        resolver.delete(uri, null, null)
        throw error
      }
      values.clear()
      values.put(MediaStore.Downloads.IS_PENDING, 0)
      resolver.update(uri, values, null, null)
      return uri to bytes.size
    }

    val publicDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    val targetDir =
      if (publicDir != null && (publicDir.exists() || publicDir.mkdirs()) && publicDir.canWrite()) {
        publicDir
      } else {
        context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
          ?: context.filesDir
      }
    val file = File(targetDir, fileName)
    FileOutputStream(file).use { stream ->
      stream.write(bytes)
      stream.flush()
      stream.fd.sync()
    }
    if (!file.exists() || file.length() <= 0L) {
      throw IllegalStateException("Dosya boş yazıldı")
    }
    MediaScannerConnection.scanFile(
      context,
      arrayOf(file.absolutePath),
      arrayOf("application/json"),
      null,
    )
    return Uri.fromFile(file) to file.length().toInt()
  }

  private fun openStream(uri: Uri): InputStream {
    if (uri.scheme == "file") {
      val path = uri.path ?: throw IllegalArgumentException("Dosya yolu yok")
      return FileInputStream(File(path))
    }
    return context.contentResolver.openInputStream(uri)
      ?: throw IllegalStateException("Dosya okunamadı")
  }
}
