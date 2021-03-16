const _ = require('lodash');
const error = require('../../common/Error');

const owner = (req, res, next) => {
    const extendedParams = _.extend({}, req.query, req.body, req.params);
    let accountId = extendedParams.accountId || extendedParams.customer || _.get(req, 'user.id');
    
    req.body.accountId = _.parseInt(accountId);
    delete req.body.customer;
    delete req.query.accountId;
    delete req.query.customer;

    if (_.get(req, 'user.employee') || _.parseInt(accountId) === _.parseInt(_.get(req, 'user.id'))) {
        return next();
    } else {
        return next(new error.Forbidden('You lack permission to the requested document'));
    }
};

const send = (req, res, next) => {
    let { fields } = req.params;
    fields = _.isString(fields) ? fields.trim().split(/\s*,\s*/) : fields;
    if (_.isArray(fields) && _.isArray(req.results)) {
      req.results = _.map(req.results, (v) => {
        return _.pick(v, fields);
      });
    } else if (_.isArray(fields) && !_.isEmpty(req.results)) {
      req.results = _.pick(req.results, fields);
    }

    res.format({
      json: () => {
        if (_.get(req.results, 'code', false)) {
          if (_.get(req.results, 'error.message', false)) {
            res.status(req.results.code).send(req.results.error.message);
          } else {
            res.status(req.results.code).send(req.results);
          }
        } else {
          if (_.get(req.results, 'error.message', false)) {
            res.status(200).send(req.results.error.message);
          } else {
            res.status(200).send(req.results);
          }
        }
      },
      default: () => {
        if (_.get(req.results, 'code', false)) {
          if (_.get(req.results, 'error.message', false)) {
            res.status(req.results.code).send(req.results.error.message);
          } else {
            res.status(req.results.code).send(req.results);
          }
        } else {
          if (_.get(req.results, 'error.message', false)) {
            res.status(200).send(req.results.error.message);
          } else {
            res.status(200).send(req.results);
          }
        }
      }
    });
  };

exports.owner = owner;
exports.send = send;
