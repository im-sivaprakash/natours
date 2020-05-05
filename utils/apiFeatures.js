class ApiFeatures {
  constructor(query, qurString) {
    this.query = query;
    this.qurString = qurString;
  }

  filter() {
    //FILTERING
    const qObj = { ...this.qurString };
    const excludeQ = ['page', 'sort', 'limit', 'fields'];
    excludeQ.forEach(el => delete qObj[el]);

    //ADVANCE FILTERING
    let qurStr = JSON.stringify(qObj);
    qurStr = qurStr.replace(/\b(gt|lt|gte|lte)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(qurStr));

    return this;
  }

  sort() {
    if (this.qurString.sort) {
      const sortBy = this.qurString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }
  limit() {
    if (this.qurString.fields) {
      const field = this.qurString.fields.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.qurString.page * 1 || 1;
    const limit = this.qurString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
