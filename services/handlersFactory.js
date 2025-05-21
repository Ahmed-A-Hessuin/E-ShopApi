const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndDelete(req.params.id);
        if (!document) {
            return next(new ApiError(`No document for this id ${req.params.id}`, 404));
        }
        // Trigger "remove" When delete document
        document.remove()
        res.status(204).send();
    })

exports.updateOne = (Model) =>
    asyncHandler(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!document) {
            return next(new ApiError(`No document for this id ${req.params.id}`, 404));
        }
        // Trigger "save" When update document
        document.save()
        res.status(200).json({ data: document });
    });

exports.createOne = (Model) =>
    asyncHandler(async (req, res) => {
        // ✅ فقط لو الموديل هو Product
        if (Model.modelName === 'Product') {
            // ✅ تحقق من نوع المستخدم
            if (req.user && req.user.role === 'user') {
                req.body.status = 'pending'; // لو مستخدم عادي، نجعل الحالة معلقة
            } else {
                req.body.status = 'approved'; // لو admin أو manager نجعلها معتمدة مباشرةً
            }

            // ربط المستخدم بالمنتج
            req.body.user = req.user._id;
        }

        const newDoc = await Model.create(req.body);
        res.status(201).json({ Data: newDoc });
    });


exports.getOne = (Model, PopulationOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // 1) Build Query
        let query = Model.findById(id);
        if (PopulationOpt) {
            query = query.populate(PopulationOpt);
        }
        // 2) Execute Query
        const document = await query
        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }
        res.status(200).json({ data: document });
    });

exports.getAll = (Model, modelName = '') =>
    asyncHandler(async (req, res) => {
        let filter = {}
        if (req.filterObj) {
            filter = req.filterObj
        }
        if (modelName.toLowerCase() === 'product') {
            filter.status = 'approved';
        }
        // Build Query
        const countDocuments = await Model.countDocuments()
        const apiFeatures = new ApiFeatures(req.query, Model.find(filter))
            .paginate(countDocuments)
            .filter()
            .sort()
            .limitFields()
            .search(modelName)

        // Execute Query
        const { paginationResult, mongooseQuery } = apiFeatures
        const documents = await mongooseQuery
        res.status(200).json({ results: documents.length, paginationResult, Data: documents });
    });

