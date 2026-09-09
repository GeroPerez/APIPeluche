package gordo.peluche.Repository;

import gordo.peluche.Entidades.Producto;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long>{

}
