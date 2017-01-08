'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('TeamPeople', 'owner', {
      type: Sequelize.INTEGER
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('TeamPeople', 'owner', {
      type: Sequelize.STRING
    });
  }
};
