const rateLimitErrorMessage = 'rate limit enforced';

class RateLimiter {
  constructor(currentValue, limit, timePeriodRetriever, onSaveLimit) {
    this.currentValue = currentValue;
    this.limit = limit;
    this.timePeriodRetriever = timePeriodRetriever;
    this.onSaveLimit = onSaveLimit;

    this.period = this.timePeriodRetriever();
  }

  execute(promiseFactory) {
    const period = this.timePeriodRetriever();

    if (period.getTime() !== this.period.getTime()) {
      this.period = period;
      this.currentValue = 0;
    }

    if (this.currentValue >= this.limit) {
      return Promise.reject(new Error(rateLimitErrorMessage));
    }

    this.currentValue += 1;
    this.onSaveLimit(this.currentValue, period);
    return promiseFactory();
  }
}

module.exports = { RateLimiter, rateLimitErrorMessage };
