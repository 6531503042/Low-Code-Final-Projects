/// Sealed Result class for handling success and error states
sealed class Result<T> {
  const Result();
}

/// Success result containing data
final class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

/// Error result containing error message
final class Error<T> extends Result<T> {
  const Error(this.message);
  final String message;
}

/// Extension methods for Result
extension ResultExtension<T> on Result<T> {
  /// Check if result is success
  bool get isOk => this is Ok<T>;
  
  /// Check if result is error
  bool get isError => this is Error<T>;
  
  /// Get value if success, null otherwise
  T? get valueOrNull => isOk ? (this as Ok<T>).value : null;
  
  /// Get error message if error, null otherwise
  String? get errorOrNull => isError ? (this as Error<T>).message : null;
  
  /// Map success value to another type
  Result<R> map<R>(R Function(T value) mapper) {
    return switch (this) {
      Ok<T>(value: final value) => Ok(mapper(value)),
      Error<T>(message: final message) => Error<R>(message),
    };
  }
  
  /// Handle both success and error cases
  R when<R>({
    required R Function(T value) onSuccess,
    required R Function(String message) onError,
  }) {
    return switch (this) {
      Ok<T>(value: final value) => onSuccess(value),
      Error<T>(message: final message) => onError(message),
    };
  }
}
